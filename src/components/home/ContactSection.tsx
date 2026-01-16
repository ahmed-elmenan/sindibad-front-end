import { motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { submitContactForm } from "@/services/contact.service";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const ContactSection = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("contact.first_name_required");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("contact.last_name_required");
    }
    if (!formData.email) {
      newErrors.email = t("contact.email_required");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("contact.email_invalid");
    }
    if (!formData.message.trim()) {
      newErrors.message = t("contact.message_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const success = await submitContactForm(formData);
      if (success) {
        setMessage({ type: "success", text: t("contact.message_sent") });
        setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
      } else {
        setMessage({ type: "error", text: t("contact.send_error") });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessage({ type: "error", text: t("contact.send_error") });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: t("contact.address_title") || "Address",
      content: "Khouribga, Morocco",
      color: "text-primary"
    },
    {
      icon: Phone,
      title: t("contact.phone_title") || "Phone",
      content: "+212 5XX-XXXXXX",
      color: "text-green-500"
    },
    {
      icon: Mail,
      title: t("contact.email_title") || "Email",
      content: "contact@sindibad.com",
      color: "text-blue-500"
    },
    {
      icon: Clock,
      title: t("contact.hours_title") || "Working Hours",
      content: "Mon - Fri: 9:00 AM - 6:00 PM",
      color: "text-orange-500"
    }
  ];

  return (
    <section id="contact" className="py-20 bg-white dark:bg-background relative overflow-hidden">

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 dark:border-primary/30">
            <Mail className="w-4 h-4 mr-2" />
            Contact Us
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-clip-text">
              {t("contact.get_in_touch") || "Get In Touch"}
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("contact.section_description") || "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
          {/* Left Side - Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold mb-6 text-foreground">
                {t("contact.contact_information") || "Contact Information"}
              </h3>
              <p className="text-muted-foreground mb-8">
                {t("contact.info_description") || "Feel free to reach out to us through any of the following channels. We're here to help!"}
              </p>
            </div>

            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className={`${info.color}`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">{info.title}</h4>
                    <p className="text-muted-foreground">{info.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-2 hover:border-primary/30 transition-all duration-300 shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Message Alert */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-2 p-4 rounded-lg ${
                        message.type === "success"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                      }`}
                    >
                      {message.type === "success" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <p className="text-sm font-medium">{message.text}</p>
                    </motion.div>
                  )}

                  {/* First Name & Last Name */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("contact.first_name")}</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder={t("contact.first_name")}
                        className={`${errors.firstName ? "border-red-500" : ""} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                        disabled={isLoading}
                      />
                      {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("contact.last_name")}</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder={t("contact.last_name")}
                        className={`${errors.lastName ? "border-red-500" : ""} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                        disabled={isLoading}
                      />
                      {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("contact.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("contact.email")}
                      className={`${errors.email ? "border-red-500" : ""} transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <Label htmlFor="subject">{t("contact.subject")}</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t("contact.subject")}
                      className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">{t("contact.message")}</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t("contact.message")}
                      className={`${errors.message ? "border-red-500" : ""} min-h-[150px] transition-all duration-300 focus:ring-2 focus:ring-primary`}
                      disabled={isLoading}
                    />
                    {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t("contact.sending") || "Sending..."}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        {t("contact.send_message") || "Send Message"}
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
