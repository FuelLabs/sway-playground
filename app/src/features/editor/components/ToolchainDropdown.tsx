import React, { useContext } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import { ThemeContext } from '../../../theme/themeContext';
import { darkColors, lightColors } from '@fuel-ui/css';

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

  return (
    <FormControl
      style={{ ...style }}
      sx={{
        '& fieldset': {
          border: theme === 'light' ? '1px solid lightgrey' : 'none',
        },
        '.MuiInputBase-root': {
          bgcolor: theme === 'light' ? 'inherit' : darkColors.gray1,
          color: theme === 'light' ? 'inherit' : lightColors.scalesGreen7,
          borderBottom:
            theme === 'light'
              ? 'inherit'
              : `1px solid ${lightColors.scalesGreen7}`,
          borderRight:
            theme === 'light'
              ? 'inherit'
              : `1px solid ${lightColors.scalesGreen7}`,
          '&:hover': {
            background: theme === 'light' ? 'inherit' : 'black',
          },
        },
        //color of dropdown label
        '.MuiFormLabel-root': {
          color: theme === 'light' ? 'inherit' : '#E0FFFF',
        },
        //color of dropdown svg icon
        '.MuiSvgIcon-root': {
          color: theme === 'light' ? 'inherit' : lightColors.scalesGreen7,
        },
      }}
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
