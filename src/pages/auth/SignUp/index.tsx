import { useSearchParams } from "react-router-dom";
import SignUpOrganisation from "@/components/form/SignUpOrganisation";
import SignUpLearner from "@/components/form/SignUpLearner";
import ChooseAccountType from "@/components/ChooseAccountType";

const SignUpPage = () => {
  const [searchParams] = useSearchParams();
  const accountType = searchParams.get("account");

  // Fonction pour rendre le bon composant selon le type de compte
  const renderSignUpComponent = () => {
    switch (accountType) {
      case "organisation":
        return <SignUpOrganisation />;
      case "learner":
        return <SignUpLearner />;
      default:
        // Utilisation du nouveau composant de sélection du type de compte
        return <ChooseAccountType />;
    }
  };

  return (
    <div className="flex justify-center bg-background py-6 px-4">
      <div className="w-full">{renderSignUpComponent()}</div>
    </div>
  );
};

export default SignUpPage;
