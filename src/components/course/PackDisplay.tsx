import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { Pack } from "@/types/Pack";

interface PackDisplayProps {
  packs: Pack[];
  coursePrice: number;
  showTitle?: boolean;
}

export default function PackDisplay({
  packs,
  coursePrice,
  showTitle = true,
}: PackDisplayProps) {
  if (packs.length === 0) {
    return (
      <Card>
        {showTitle && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Packs de Réduction
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Aucun pack de réduction configuré pour ce cours
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Packs de Réduction Disponibles
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="grid gap-4">
          {packs.map((pack) => {
            const pricePerLearner =
              coursePrice * (1 - pack.discountPercentage / 100);

            return (
              <div
                key={pack.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-orange-400 transition-colors bg-white"
              >
                {/* En-tête du pack */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
                  <Users className="h-5 w-5 text-orange-600" />
                  <h4 className="font-semibold text-gray-900 text-lg">
                    Pack {pack.minLearners === pack.maxLearners
                      ? `${pack.minLearners} apprenant${pack.minLearners > 1 ? "s" : ""}`
                      : `${pack.minLearners} - ${pack.maxLearners} apprenants`}
                  </h4>
                </div>

                {/* Informations du pack */}
                <div className="space-y-3">
                  {/* Min et Max Learners */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Min. apprenants</div>
                      <div className="text-lg font-bold text-gray-900">{pack.minLearners}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Max. apprenants</div>
                      <div className="text-lg font-bold text-gray-900">{pack.maxLearners}</div>
                    </div>
                  </div>

                  {/* Réduction */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Réduction appliquée</div>
                        <div className="text-2xl font-bold text-green-700">
                          {pack.discountPercentage}%
                        </div>
                      </div>
                      {pack.discountPercentage > 0 && (
                        <Badge className="bg-green-600 text-white hover:bg-green-700">
                          -{pack.discountPercentage}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Prix */}
                  <div className="space-y-2">
                    {pack.discountPercentage > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Prix par apprenant:</span>
                          <div className="text-right">
                            <span className="text-sm line-through text-gray-400 mr-2">
                              {coursePrice.toFixed(2)} MAD
                            </span>
                            <span className="text-lg font-semibold text-orange-600">
                              {pricePerLearner.toFixed(2)} MAD
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Prix par apprenant:</span>
                          <span className="text-lg font-semibold text-orange-600">
                            {coursePrice.toFixed(2)} MAD
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
