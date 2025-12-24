import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-slate-900 dark:bg-black text-white py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl"></div>
              <span
                className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => navigate("/")}
              >
                SindiBad
              </span>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Empowering learners worldwide with premium education technology
              and expert-led courses.
            </p>
            <div className="flex space-x-4">
              {["facebook", "twitter", "linkedin", "instagram"].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-primary hover:to-secondary rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Learning</h3>
            <ul className="space-y-3 text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Browse Courses
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Learning Paths
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Certifications
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Free Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-lg">Support</h3>
            <ul className="space-y-3 text-slate-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-slate-400">
          <p>&copy; 2025 TECH-57. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
