import { useCallFunction } from '../hooks/useCallFunction';
import { CallType } from '../../../utils/types';
import { CallableParamValue } from './FunctionParameters';
import SecondaryButton from '../../../components/SecondaryButton';

interface CallButtonProps {
  contractId: string;
  functionName: string;
  parameters: CallableParamValue[];
  callType: CallType;
  setResponse: (response: string) => void;
  setError: (error: string) => void;
}

export function CallButton({
  contractId,
  functionName,
  parameters,
  callType,
  setResponse,
  setError,
}: CallButtonProps) {
  const functionMutation = useCallFunction({
    contractId,
    functionName,
    parameters,
    callType,
    setResponse,
    setError,
  });

  function onFunctionClick() {
    setResponse('');
    functionMutation.mutate();
  }

  return (
    <SecondaryButton
      onClick={onFunctionClick}
      text='CALL'
      tooltip='Call the contract function with the provided arguments'
    />
  );
}