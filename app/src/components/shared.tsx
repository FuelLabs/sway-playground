import React, { useContext } from 'react';
import styled from '@emotion/styled';
import CircularProgress from '@mui/material/CircularProgress';
import Copyable from './Copyable';
import { lightColors } from '@fuel-ui/css';
import { ThemeContext } from '../theme/themeContext';

const BorderColor = () => {
  const theme = useContext(ThemeContext);
  const borderColor = theme?.theme === 'light' ? 'lightgrey' : '#181818';
  return borderColor;
};

export const StyledBorder = styled.div`
  border: 4px solid ${BorderColor}; //change color based on theme
  border-radius: 5px;
`;

export const ButtonSpinner = () => (
  <CircularProgress
    style={{
      margin: '2px',
      height: '14px',
      width: '14px',
      color: lightColors.scalesGreen10,
    }}
  />
);

export const CopyableHex = ({
  hex,
  tooltip,
}: {
  hex: string;
  tooltip: string;
}) => {
  const formattedHex = hex.slice(0, 6) + '...' + hex.slice(-4, hex.length);
  return <Copyable value={hex} label={formattedHex} tooltip={tooltip} />;
};
