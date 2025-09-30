mod solidity;

use self::solidity::run_charcoal;
use crate::{error::ApiError, types::TranspileResponse, util::clean_error_content};
use nanoid::nanoid;
use regex::Regex;
use std::{
    fs::{create_dir_all, remove_dir_all, File},
    io::Write,
    path::PathBuf,
};

const TMP: &str = "tmp";
const FILE_NAME: &str = "main.sol";

/// Transpile the given Solidity contract to Sway.
pub fn solidity_to_sway(contract: String) -> Result<TranspileResponse, ApiError> {
    if contract.is_empty() {
        return Ok(TranspileResponse {
            sway_contract: "".to_string(),
            error: Some("No contract.".to_string()),
        });
    }

    let project_name =
        create_project(contract).map_err(|_| ApiError::Filesystem("create project".into()))?;

    // Run charcoal on the file and capture the output.
    let output = run_charcoal(contract_path(project_name.clone()));
    let response = if !output.stderr.is_empty() {
        let error: &str =
            std::str::from_utf8(&output.stderr).map_err(|e| ApiError::Charcoal(e.to_string()))?;
        TranspileResponse {
            sway_contract: "".to_string(),
            error: Some(clean_error_content(error.to_string(), FILE_NAME)),
        }
    } else if !output.stdout.is_empty() {
        let result =
            std::str::from_utf8(&output.stdout).map_err(|e| ApiError::Charcoal(e.to_string()))?;

        // Replace the generated comments from charcoal with a custom comment.
        let re =
            Regex::new(r"// Translated from.*").map_err(|e| ApiError::Charcoal(e.to_string()))?;
        let replacement = "// Transpiled from Solidity using charcoal. Generated code may be incorrect or unoptimal.";
        let sway_contract = re.replace_all(result, replacement).into_owned();

        TranspileResponse {
            sway_contract,
            error: None,
        }
    } else {
        TranspileResponse {
            sway_contract: "".to_string(),
            error: Some(
                "An unknown error occurred while transpiling the Solidity contract.".to_string(),
            ),
        }
    };

    // Delete the temporary file.
    if let Err(err) = remove_project(project_name.clone()) {
        return Ok(TranspileResponse {
            sway_contract: String::from(""),
            error: Some(format!("Failed to remove temporary file: {err}")),
        });
    }

    Ok(response)
}

fn create_project(contract: String) -> std::io::Result<String> {
    // Create a new project file.
    let project_name = nanoid!();
    create_dir_all(project_path(project_name.clone()))?;
    let mut file = File::create(contract_path(project_name.clone()))?;

    // Write the contract to the file.
    file.write_all(contract.as_bytes())?;
    Ok(project_name)
}

fn remove_project(project_name: String) -> std::io::Result<()> {
    remove_dir_all(project_path(project_name))
}

fn project_path(project_name: String) -> String {
    format!("{TMP}/{project_name}")
}

fn contract_path(project_name: String) -> PathBuf {
    PathBuf::from(format!("{}/{FILE_NAME}", project_path(project_name)))
}
