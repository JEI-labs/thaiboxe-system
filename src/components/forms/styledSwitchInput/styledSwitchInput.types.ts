export interface StyledSwitchComponentProps {
  title?: string;
  topDescription?: string;
  bottomDescription?: string;
  className?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}
