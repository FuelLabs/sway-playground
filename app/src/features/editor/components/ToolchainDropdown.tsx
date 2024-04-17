import React, { useContext } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import { ThemeContext } from '../../../theme/themeContext';
import { DarkThemeStyling } from '../../../components/shared';

const ToolchainNames = [
  'beta-5',
  'beta-4',
  'beta-3',
  'beta-2',
  'beta-1',
  'latest',
  'nightly',
] as const;
export type Toolchain = (typeof ToolchainNames)[number];

export interface ToolchainDropdownProps {
  toolchain: Toolchain;
  setToolchain: (toolchain: Toolchain) => void;
  style?: React.CSSProperties;
}
function ToolchainDropdown({
  toolchain,
  setToolchain,
  style,
}: ToolchainDropdownProps) {
  // Import theme state
  const theme = useContext(ThemeContext)?.theme;

  const dropdownStyling = theme !== 'light' ? DarkThemeStyling.darkDropdown : {};

  return (
    <FormControl
      sx={ {...style , ...dropdownStyling}}
      size='small'
    >
      <InputLabel id='toolchain-select-label'>Toolchain</InputLabel>
      <Tooltip placement='top' title={'Fuel toolchain to use for compilation'}>
        <span>
          <Select
            MenuProps={{
              PaperProps: {
                style: {
                  background: theme === 'light' ? 'white' : '#181818',
                  color: theme === 'light' ? '#181818' : 'white',
                },
              },
            }}
            id='toolchain-select'
            labelId='toolchain-select-label'
            label='Toolchain'
            style={{ minWidth: '70px' }}
            variant='outlined'
            value={toolchain}
            onChange={(event) => setToolchain(event.target.value as Toolchain)}>
            {ToolchainNames.map((toolchain) => (
              <MenuItem key={toolchain} value={toolchain}>
                {toolchain}
              </MenuItem>
            ))}
          </Select>
        </span>
      </Tooltip>
    </FormControl>
  );
}

export default ToolchainDropdown;
