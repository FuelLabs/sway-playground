import React, { useContext } from "react";
import { InputInstance, SimpleParamValue } from './FunctionParameters';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ComplexParameterInput from './ComplexParameterInput';
import { lightColors } from '@fuel-ui/css';
import { ThemeContext } from "../../../theme/themeContext";

export interface ParameterInputProps {
  input: InputInstance;
  value: SimpleParamValue;
  onChange: (value: SimpleParamValue) => void;
}

function ParameterInput({ input, value, onChange }: ParameterInputProps) {
  // Import theme state
  const theme = useContext(ThemeContext)?.theme;
  switch (input.type.literal) {
    case 'string':
      return (
        <TextField
          size='small'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(event.target.value);
          }}
          sx={{
            '& fieldset': {
              border: theme === 'light' ? '1px solid lightgrey' : 'none',
            },
            '.MuiInputBase-root': {
              border:
                theme === 'light'
                  ? 'inherit'
                  : `1px solid ${lightColors.scalesGreen7}`,
              bgcolor: theme === 'light' ? 'inherit' : 'transparent',
              color: theme === 'light' ? 'inherit' : '#E0FFFF',
            },
          }}
        />
      );
    case 'number':
      return (
        <TextField
          size='small'
          type='number'
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            onChange(Number.parseFloat(event.target.value));
          }}
          sx={{
            '& fieldset': {
              border: theme === 'light' ? '1px solid lightgrey' : 'none',
            },
            '.MuiInputBase-root': {
              border:
                theme === 'light'
                  ? 'inherit'
                  : `1px solid ${lightColors.scalesGreen7}`,
              bgcolor: theme === 'light' ? 'inherit' : 'transparent',
              color: theme === 'light' ? 'inherit' : '#E0FFFF',
            },
          }}
        />
      );
    case 'bool':
      return (
        <ToggleButtonGroup
          size='small'
          color='primary'
          value={`${!!value}`}
          exclusive
          onChange={() => onChange(!value)}>
          <ToggleButton value='true'>true</ToggleButton>
          <ToggleButton value='false'>false</ToggleButton>
        </ToggleButtonGroup>
      );
      case 'vector':
      case 'enum':
      case 'option':
      case 'object':
      return (
        <ComplexParameterInput
          input={input}
          value={value as string}
          onChange={onChange}
        />
      );
  }
}

export default ParameterInput;
