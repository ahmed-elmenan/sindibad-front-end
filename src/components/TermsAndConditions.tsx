import { useTranslation } from "react-i18next";

interface TermsAndConditionsProps {
  userType?: "learner" | "coordinator"; // Prop optionnelle pour spécifier le type d'utilisateur
}

export function TermsAndConditions({
  userType = "learner",
}: TermsAndConditionsProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // Composant réutilisable pour les éléments de liste à puces
  const BulletItem = ({ children }: { children: React.ReactNode }) => (
    <li
      className={`flex items-start gap-2 ${
        isRTL ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="ltr:hidden rtl:inline">•</span>
      <span>{children}</span>
    </li>
  );

  return (
    <div
      className={`prose prose-sm max-w-none space-y-6 text-foreground ${
        isRTL ? "rtl text-right" : ""
      }`}
    >
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">
          {t("common.terms.title")}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          {t("common.terms.lastUpdate")}
        </p>
      </div>

      {/* Section 1: Collecte des informations */}
      <section>
        <h3 className="text-lg font-semibold mb-3">
          {t("common.terms.content.section1.title")}
        </h3>
        <p className="mb-4">
          {t(`common.terms.content.section1.text.${userType}`)}
        </p>
      </section>

      {/* Section 2: Section visible uniquement pour les coordinateurs */}
      {userType === "coordinator" && (
        <section>
          <h3 className="text-lg font-semibold mb-3">
            {t("common.terms.content.section2.title")}
          </h3>
          <p className="mb-4">{t("common.terms.content.section2.text")}</p>
          <ul className={`list-disc ${isRTL ? "pr-6" : "pl-6"} mb-4 space-y-2`}>
            <li>{t("common.form.firstName.label")}</li>
            <li>{t("common.form.lastName.label")}</li>
            <li>{t("common.form.email.label")}</li>
            <li>{t("common.form.dateOfBirth.label")}</li>
            <li>{t("common.form.phone.label")}</li>
            <li>{t("common.form.gender.label")}</li>
          </ul>
        </section>
      )}

      {/* Section 3: Confidentialité - Commune aux deux types */}
      <section>
        <h3 className="text-lg font-semibold mb-3">
          {t("common.terms.content.section3.title")}
        </h3>
        <p className="mb-4">{t("common.terms.content.section3.text")}</p>
        <div
          className={`border-${isRTL ? "r-4" : "l-4"} border-primary ${
            isRTL ? "pr-4" : "pl-4"
          } mb-4`}
        >
          <p className="text-sm italic">
            {t("common.terms.content.section3.note")}
          </p>
        </div>
      </section>

      {/* Section 4: Sécurité - Commune aux deux types */}
      <section>
        <h3 className="text-lg font-semibold mb-3">
          {t("common.terms.content.section4.title")}
        </h3>
        <p className="mb-4">{t("common.terms.content.section4.text")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-accent/10 p-3 rounded">
            <h5 className="font-medium mb-2">
              {t("common.terms.content.section4.measures.title")}
            </h5>
            <ul className="text-sm space-y-1">
              <BulletItem>
                {t("common.terms.content.section4.measures.item1")}
              </BulletItem>
              <BulletItem>
                {t("common.terms.content.section4.measures.item2")}
              </BulletItem>
              <BulletItem>
                {t("common.terms.content.section4.measures.item3")}
              </BulletItem>
            </ul>
          </div>
          <div className="bg-muted p-3 rounded">
            <h5 className="font-medium mb-2">
              {t("common.terms.content.section4.protection.title")}
            </h5>
            <ul className="text-sm space-y-1">
              <BulletItem>
                {t("common.terms.content.section4.protection.item1")}
              </BulletItem>
              <BulletItem>
                {t("common.terms.content.section4.protection.item2")}
              </BulletItem>
              <BulletItem>
                {t("common.terms.content.section4.protection.item3")}
              </BulletItem>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 5: Droit d'accès */}
      <section>
        <h3 className="text-lg font-semibold mb-3">
          {t("common.terms.content.section5.title")}
        </h3>
        <p className="mb-4">
          {t(`common.terms.content.section5.text.${userType}`)}
        </p>
        <div className="bg-muted p-4 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">
            {t("common.terms.content.section5.procedure.title")}
          </h4>
          <p className="text-sm">
            {t(`common.terms.content.section5.procedure.text.${userType}`)}
          </p>
        </div>
      </section>

      {/* Section 6: Engagement */}
      <section>
        <h3 className="text-lg font-semibold mb-3">
          {t("common.terms.content.section6.title")}
        </h3>
        <p className="mb-4">
          {t(`common.terms.content.section6.text.${userType}`)}
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <p className="text-sm">
            <strong className={isRTL ? "ml-1" : "mr-1"}>
              {t("common.terms.content.section6.note.label")}
            </strong>
            {t(`common.terms.content.section6.note.text.${userType}`)}
          </p>
        </div>
      </section>

      {/* Footer - Commun aux deux types */}
      <div className="border-t pt-6 mt-8">
        <p className="text-sm text-muted-foreground text-center">
          {t("common.terms.footer")}
        </p>
      </div>
    </div>
  );
}
