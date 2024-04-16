import React, { useCallback, useContext } from 'react';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl/FormControl';
import Select from '@mui/material/Select/Select';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import { ThemeContext } from '../../../theme/themeContext';
import { darkColors, lightColors } from '@fuel-ui/css';

export interface ExampleMenuItem {
  label: string;
  code: string;
}

export interface ExampleDropdownProps {
  handleSelect: (example: string) => void;
  examples: ExampleMenuItem[];
  style?: React.CSSProperties;
}

function ExampleDropdown({
  handleSelect,
  examples,
  style,
}: ExampleDropdownProps) {
  const [currentExample, setCurrentExample] = React.useState<ExampleMenuItem>({
    label: '',
    code: '',
  });

  const onChange = useCallback(
    (event: any) => {
      const index = event.target.value as number;
      const example = examples[index];
      if (example) {
        setCurrentExample(example);
        handleSelect(example.code);
      }
    },
    [handleSelect, setCurrentExample, examples]
  );

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
      size='small'>
      <InputLabel id='example-select-label'>Example</InputLabel>
      <Tooltip placement='top' title={'Load an example contract'}>
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
            id='example-select'
            labelId='example-select-label'
            label='Example'
            variant='outlined'
            style={{ minWidth: '110px' }}
            value={currentExample.label}
            onChange={onChange}>
            {examples.map(({ label }: ExampleMenuItem, index) => (
              <MenuItem key={`${label}-${index}`} value={index}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </span>
      </Tooltip>
    </FormControl>
  );
}

export default ExampleDropdown;
