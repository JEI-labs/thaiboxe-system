export interface StyledSwitchComponentProps {
  title?: string;
  topDescription?: string;
  bottomDescription?: string;
  className?: string;
  value: boolean;
  onChange: (_value: boolean) => void;
  disabled?: boolean;
}
