import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/theme-chrome';
import { StyledBorder } from '../../../components/shared';
import 'ace-mode-solidity/build/remix-ide/mode-solidity';
import ActionOverlay from './ActionOverlay';
import { useIsMobile } from '../../../hooks/useIsMobile';

export interface SolidityEditorProps {
  code: string;
  onChange: (value: string) => void;
}

function SolidityEditor({ code, onChange }: SolidityEditorProps) {
  const isMobile = useIsMobile();

  return (
    <StyledBorder
      style={{
        flex: 1,
        marginRight: isMobile ? 0 : '1rem',
        marginBottom: isMobile ? '1rem' : 0,
      }}>
      <ActionOverlay handleSelectExample={onChange} editorLanguage='solidity'/>
      <AceEditor
        style={{
          width: '100%',
          height: '100%',
        }}
        mode='solidity'
        theme='chrome'
        name='editor'
        fontSize='14px'
        onChange={onChange}
        value={code}
        editorProps={{ $blockScrolling: true }}
      />
    </StyledBorder>
  );
}

export default SolidityEditor;
