import React, { useCallback, useContext } from 'react';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl/FormControl';
import Select from '@mui/material/Select/Select';
import InputLabel from '@mui/material/InputLabel/InputLabel';
import { ThemeContext } from '../../../theme/themeContext';
import { DarkThemeStyling } from '../../../components/shared';

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

  const dropdownStyling = theme !== 'light' ? DarkThemeStyling.darkDropdown : {};
  return (
    <FormControl
      sx={ {...style , ...dropdownStyling}}
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
