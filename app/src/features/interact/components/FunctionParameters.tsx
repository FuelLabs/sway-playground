import * as React from 'react';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Table, { TableProps } from '@mui/material/Table';
import { styled } from '@mui/material/styles';
import { ThemeContext } from '../../../theme/themeContext';
import { useContext } from 'react';
import { lightColors } from '@fuel-ui/css';
import Paper from '@mui/material/Paper';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import ParameterInput from './ParameterInput';
import { TypeInfo } from '../utils/getTypeInfo';

export type ParamTypeLiteral =
  | 'number'
  | 'bool'
  | 'string'
  | 'object'
  | 'option'
  | 'enum'
  | 'vector';
export type SimpleParamValue = number | boolean | string;
export type ObjectParamValue = Record<
  string,
  SimpleParamValue | Record<string, any> | VectorParamValue
>;
export type VectorParamValue = Array<CallableParamValue>;
export type CallableParamValue =
  | SimpleParamValue
  | ObjectParamValue
  | VectorParamValue;

export interface InputInstance {
  name: string;
  type: TypeInfo;
  components?: InputInstance[];
}

interface FunctionParametersProps {
  inputInstances: InputInstance[];
  functionName: string;
  paramValues: SimpleParamValue[];
  setParamValues: (values: SimpleParamValue[]) => void;
}

export function FunctionParameters({
  inputInstances,
  functionName,
  paramValues,
  setParamValues,
}: FunctionParametersProps) {

  // Import theme state
  const theme = useContext(ThemeContext);

  const setParamAtIndex = React.useCallback(
    (index: number, value: SimpleParamValue) => {
      const newParamValues = [...paramValues];
      newParamValues[index] = value;
      setParamValues(newParamValues);
    },
    [paramValues, setParamValues]
  );

  if (!inputInstances.length) {
    return <React.Fragment />;
  }

  // Created custom Table
  const TableCellComponent = styled(TableCell)<TableProps>(() => ({
    color: theme?.theme === 'light' ? '' : lightColors.scalesGreen3,
  }));

  return (
    <TableContainer component={Paper} style={{ background: theme?.theme === 'light' ? '' : '#1F1F1F' }}>
      <Table aria-label='function parameter table'>
        <TableHead>
          <TableRow>
            <TableCellComponent>Name</TableCellComponent>
            <TableCellComponent>Type</TableCellComponent>
            <TableCellComponent>Value</TableCellComponent>
          </TableRow>
        </TableHead>
        <TableBody>
          {inputInstances.map((input, index) => (
            <TableRow
              key={functionName + input.name + index}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCellComponent component='th' scope='row'>
                {input.name}
              </TableCellComponent>
              <TableCellComponent>{input.type.swayType}</TableCellComponent>
              <TableCell style={{ width: '100%'}}>
                <ParameterInput
                  input={input}
                  value={paramValues[index]}
                  onChange={(value: SimpleParamValue) =>
                    setParamAtIndex(index, value)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
