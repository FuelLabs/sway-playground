# Stage 1: Build
FROM lukemathwalker/cargo-chef:latest-rust-1.82 AS chef
WORKDIR /build/
# hadolint ignore=DL3008

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    lld \
    clang \
    libclang-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Build sway-playground
FROM chef AS planner
ENV CARGO_NET_GIT_FETCH_WITH_CLI=true
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder

# Install charcoal
RUN cargo install --git https://github.com/FuelLabs/charcoal.git --rev e69a6ffaf3e7eaf9f3ceea543087ea59ec5fd5d1

ENV CARGO_NET_GIT_FETCH_WITH_CLI=true
COPY --from=planner /build/recipe.json recipe.json
# Build our project dependencies, not our application!
RUN cargo chef cook --recipe-path recipe.json
# Up to this point, if our dependency tree stays the same,
# all layers should be cached.
COPY . .
RUN cargo build

# Stage 2: Run
FROM ubuntu:22.04 AS run

RUN apt-get update -y \
    && apt-get install -y --no-install-recommends ca-certificates curl git pkg-config libssl-dev \
    # Clean up
    && apt-get autoremove -y \
    && apt-get clean -y \
    && rm -rf /var/lib/apt/lists/*

# Setup non-root user for running container to avoid potential security exploits
RUN groupadd -r sway && useradd --create-home --shell /bin/false -r -g sway sway
WORKDIR /home/sway
USER sway

# These files will be owned by `root` and are unable to be modified at runtime
COPY --from=builder /build/target/debug/sway-playground .
COPY --from=builder /build/target/debug/sway-playground.d .
COPY --from=builder /usr/local/cargo/bin/charcoal /bin
COPY --from=builder /build/Rocket.toml .

# Setting ownership on this directory so compiler can write to `projects` directory
COPY --chown=sway:sway --from=builder /build/projects projects

# Install fuelup
RUN curl -fsSL https://install.fuel.network/ | sh -s -- --no-modify-path
ENV PATH="/home/sway/.fuelup/bin:$PATH"

# Install all fuel toolchains
RUN fuelup toolchain install latest
RUN fuelup toolchain install nightly
RUN fuelup toolchain install testnet
RUN fuelup toolchain install mainnet

# Install the forc dependencies
RUN fuelup default testnet
RUN forc build --path projects/swaypad

EXPOSE 8080

CMD ["./sway-playground"]
