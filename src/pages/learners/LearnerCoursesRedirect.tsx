import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LearnerCoursesRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to courses page with status=ACTIVE to show subscribed/active courses
    navigate("/courses?status=ACTIVE", { replace: true });
  }, [navigate]);

  return null;
}
