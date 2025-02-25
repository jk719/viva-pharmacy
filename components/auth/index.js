// Import directly from files
import AuthButtons from './AuthButtons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

// Export as namespace object to prevent initialization issues
const Auth = {
  AuthButtons,
  PasswordStrengthIndicator
};

export default Auth;
export { AuthButtons, PasswordStrengthIndicator };
