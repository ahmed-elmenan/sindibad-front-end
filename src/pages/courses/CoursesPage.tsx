"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CourseCardSkeleton } from "@/components/course/skeletons";
import {
  AlertCircle,
  BarChart3,
  Tag,
  Star,
  Search,
  Filter,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { getAllCourses, getCategories } from "@/services/course.service";
import type { Course } from "@/types/Course";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";
import CourseCard from "@/components/course/CourseCard";

import type { SubscriptionStatus } from "@/types/enum/SubscriptionStatus";
import { usePageTitle } from "@/hooks/usePageTitle";

interface FilterState {
  search: string;
  category: string;
  level: string;
  priceRange: string;
  minRating: string;
  status: SubscriptionStatus | undefined;
}

export default function CoursesPage() {
  usePageTitle("courses_catalog"); // Set the page title in English
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const PAGE_LIMIT = 12;

  const SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ["ACTIVE", "EXPIRED", "PENDING", "REJECTED"];

  const [skeletonCount, setSkeletonCount] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get current filters from URL
  const filters: FilterState = useMemo(() => ({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    priceRange: searchParams.get("priceRange") || "",
    minRating: searchParams.get("minRating") || "",
    status: (searchParams.get("status") as SubscriptionStatus) || undefined,
  }), [searchParams]);
  
  const [searchInput, setSearchInput] = useState(filters.search);

  // Update URL with new filters
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const currentFilters = {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "",
      level: searchParams.get("level") || "",
      priceRange: searchParams.get("priceRange") || "",
      minRating: searchParams.get("minRating") || "",
      status: searchParams.get("status") || "",
    };
    
    const updatedFilters = { ...currentFilters, ...newFilters };
    const params = new URLSearchParams();
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== "" && value !== "all") {
        params.set(key, value);
      }
    });
    
    setSearchParams(params, { replace: true });
  };

  // React Query for categories
  const {
    data: categories = []
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const categoriesRes = await getCategories();
      return Array.isArray(categoriesRes) ? categoriesRes : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Types for infinite query
  interface CoursePageData {
    courses: Course[];
    hasMore: boolean;
    page: number;
  }

  // React Query for courses with infinite pagination
  const {
    data: coursesData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery<CoursePageData>({
    queryKey: ['courses', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await getAllCourses(pageParam as number, PAGE_LIMIT, filters);
      return {
        courses: Array.isArray(result.courses) ? result.courses : [],
        hasMore: result.hasMore,
        page: pageParam as number
      };
    },
    getNextPageParam: (lastPage: CoursePageData) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Memoize courses to prevent unnecessary re-renders
  const courses = useMemo(
    () => coursesData?.pages?.flatMap((page: CoursePageData) => page.courses) || [],
    [coursesData]
  );

  // Set up responsive skeleton count
  useEffect(() => {
    const getSkeletonCount = () => {
      const width = window.innerWidth;
      if (width < 640) return 2;  // Mobile: 1 colonne
      if (width < 1024) return 4; // Tablet: 2 colonnes
      if (width < 1280) return 6; // Desktop: 2 colonnes
      if (width < 1536) return 9; // Large: 3 colonnes
      return 12;                  // 2XL: 4 colonnes
    };
    setSkeletonCount(getSkeletonCount());
    const handleResize = () => setSkeletonCount(getSkeletonCount());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync searchInput with URL filters
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.search) {
        handleFilterChange("search", searchInput);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const uniqueCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  // Liste fixe des niveaux
  const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    if (key === "status") {
      updateFilters({ [key]: value === "all" ? undefined : value as SubscriptionStatus });
    } else {
      updateFilters({ [key]: value === "all" ? "" : value });
    }
  };

  const resetAndSearch = () => {
    setSearchInput("");
    handleFilterChange("search", "");
  };

  const clearFilters = () => {
    updateFilters({
      search: "",
      category: "",
      level: "",
      priceRange: "",
      minRating: "",
      status: undefined,
    });
    setSearchInput("");
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => {
      if (key === 'status') {
        return value !== undefined && value !== '';
      }
      return value !== '' && value !== 'title';
    }
  );

  if (isError && courses.length === 0) {
    return (
      <>
        <div className="min-h-screen gradient-bg flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {t("courses.errorTitle")}
            </h2>
            <p className="text-gray-600 mb-4">{error?.message || "An error occurred"}</p>
            <Button
              onClick={() => refetch()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {t("courses.retry")}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // Loading states for React Query
  const isInitialLoading = isLoading && courses.length === 0;
  const isFilteringLoading = isLoading && courses.length > 0;
  const isNextPageLoading = isFetchingNextPage;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 dark:from-slate-900 dark:to-slate-800 -mt-16 pt-16">
        <main className="container mx-auto px-2 sm:px-4 py-4 md:py-8 space-y-6 md:space-y-6 max-w-7xl">
          {/* Header Section */}
          <section className="flex flex-col items-center justify-center py-8 md:py-4 text-center px-4">
            <div className="flex items-center justify-center mb-4 w-full">
              <span className="relative inline-flex items-center bg-white/90 backdrop-blur-sm rounded-xl px-4 md:px-6 py-2 md:py-3 shadow-lg border border-orange-100/50">
                <span className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="md:w-8 md:h-8"
                  >
                    <path
                      d="M16 2v6M16 24v6M2 16h6M24 16h6M7.757 7.757l4.243 4.243M20 20l4.243 4.243M7.757 24.243l4.243-4.243M20 12l4.243-4.243"
                      stroke="#ea580c"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <span className="font-bold text-xl md:text-3xl lg:text-4xl bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mx-1 md:mx-2">
                  {t("courses.headerHighlight")}
                </span>
                <span className="font-bold text-xl md:text-3xl lg:text-4xl text-gray-800 mx-1 md:mx-2">
                  {t("courses.headerTitle")}
                </span>
              </span>
            </div>
            <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2 mt-4 px-4">
              {t("courses.headerSubtitle")}
            </h2>
            <p className="text-gray-600 text-sm md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              {t("courses.headerDescription")}
            </p>
          </section>

          {/* Search and Filters */}
          <section className="space-y-4 md:space-y-6 px-4 md:px-0">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-orange-100/30 rounded-2xl blur-xl"></div>
              <Card className="relative bg-white/80 backdrop-blur-sm border border-orange-100/50 shadow-lg">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col gap-4 items-stretch md:flex-row md:items-center">
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full relative">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Search className="text-orange-400 h-4 w-4 md:h-5 md:w-5" />
                        </span>
                        <Input
                          placeholder={t("courses.filter.searchPlaceholder")}
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="pl-10 pr-10 py-2 md:py-3 text-sm md:text-lg bg-white/90 border-orange-200/60 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 rounded-xl shadow-sm w-full"
                        />
                        {searchInput && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={resetAndSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3 justify-between md:justify-start">
                      <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-10 bg-white/90 backdrop-blur-sm hover:bg-orange-600 text-gray-700 font-semibold rounded-lg px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg transition-all duration-200 w-full sm:w-auto focus:ring-1 focus:ring-orange-300 focus:border-orange-400 ${
                          showFilters ? "bg-orange-50" : ""
                        }`}
                      >
                        <SlidersHorizontal className="mr-1 md:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">
                          {t("courses.filter.filters")}
                        </span>
                        <span className="sm:hidden">
                          {t("courses.filter.filter")}
                        </span>
                        {hasActiveFilters && (
                          <Badge className="ml-1 md:ml-2 bg-orange-500 text-white text-xs px-1 md:px-2 py-1">
                            {
                              Object.values(filters).filter(
                                (v) => v !== "" && v !== "title" && v !== "all"
                              ).length
                            }
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="bg-white/90 backdrop-blur-sm border border-orange-100/50 shadow-lg animate-in slide-in-from-top-2 duration-300">
                <CardHeader className="pb-3 md:pb-4 px-4 md:px-6">
                  <CardTitle className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Filter className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
                    {t("courses.filter.advanced")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 md:px-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                    {/* Catégorie */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Tag className="h-3 w-3 md:h-4 md:w-4 text-orange-500" />
                        {t("courses.filter.category")}
                      </label>
                      <Select
                        value={filters.category}
                        onValueChange={(value) =>
                          handleFilterChange("category", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-orange-200/60 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 h-9 md:h-10 text-sm">
                          <SelectValue
                            placeholder={t("courses.filter.allCategories")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("courses.filter.allCategories")}
                          </SelectItem>
                          {uniqueCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Niveau */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                        {t("courses.filter.level")}
                      </label>
                      <Select
                        value={filters.level}
                        onValueChange={(value) =>
                          handleFilterChange("level", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-orange-200/60 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 h-9 md:h-10 text-sm">
                          <SelectValue
                            placeholder={t("courses.filter.allLevels")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("courses.filter.allLevels")}
                          </SelectItem>
                          {COURSE_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>
                              {t(`courses.filter.levels.${level.toLowerCase()}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Prix */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
                        {t("courses.filter.price")}
                      </label>
                      <Select
                        value={filters.priceRange}
                        onValueChange={(value) =>
                          handleFilterChange("priceRange", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-orange-200/60 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 h-9 md:h-10 text-sm">
                          <SelectValue
                            placeholder={t("courses.filter.allPrices")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("courses.filter.allPrices")}
                          </SelectItem>
                          <SelectItem value="0-2000">
                            {t("courses.filter.priceLow")}
                          </SelectItem>
                          <SelectItem value="2000-3000">
                            {t("courses.filter.priceMid")}
                          </SelectItem>
                          <SelectItem value="3000-4000">
                            {t("courses.filter.priceHigh")}
                          </SelectItem>
                          <SelectItem value="4000">
                            {t("courses.filter.priceVeryHigh")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Note minimum (Slider) */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                        {t("courses.filter.minRating")}
                      </label>
                      <div className="flex items-center gap-3 relative w-32 md:w-40">
                        <Slider
                          min={0}
                          max={5}
                          step={0.5}
                          value={[Number(filters.minRating) || 0]}
                          onValueChange={([value]) =>
                            handleFilterChange("minRating", value.toString())
                          }
                          className="w-32 md:w-40"
                          style={
                            {
                              "--slider-color":
                                Number(filters.minRating) < 2
                                  ? "#fbbf24" // orange-300
                                  : Number(filters.minRating) < 4
                                  ? "#f59e42" // orange-400
                                  : "#facc15",
                            } as React.CSSProperties
                          }
                        />
                        <span className="text-xs md:text-sm font-semibold text-orange-600 min-w-[32px] text-center">
                          {filters.minRating || 0}
                        </span>
                      </div>
                    </div>

                    {/* Status de souscription */}
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="h-3 w-3 md:h-4 md:w-4 text-purple-500">⭐</span>
                        {t("courses.filter.subscription.label")}
                      </label>
                      <Select
                        value={filters.status}
                        onValueChange={(value) =>
                          handleFilterChange("status", value)
                        }
                      >
                        <SelectTrigger className="bg-white border-orange-200/60 focus:border-orange-500 focus:ring-1 focus:ring-orange-200 h-9 md:h-10 text-sm">
                          <SelectValue
                            placeholder={t("courses.filter.subscription.all")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            {t("courses.filter.subscription.all")}
                          </SelectItem>
                          {SUBSCRIPTION_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {t(`courses.filter.subscription.${status.toLowerCase()}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4">
                {hasActiveFilters && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                    >
                      {
                        Object.values(filters).filter(
                          (v) => v !== "" && v !== "title" && v !== "all"
                        ).length
                      }{" "}
                      {t("courses.activeFilters")}
                    </Badge>
                  </div>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-xs md:text-sm self-start sm:self-auto"
                >
                  <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                  {t("courses.clearAll")}
                </Button>
              )}
            </div>
          </section>

          {/* Courses Grid with Infinite Scroll */}

          <section className="px-4 md:px-0">
            {isInitialLoading || isFilteringLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                  {Array.isArray(courses) &&
                    courses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  {/* Skeletons for next page loading */}
                  {isNextPageLoading &&
                    Array.from({
                      length: Math.max(2, Math.floor(skeletonCount / 4)),
                    }).map((_, i) => (
                      <CourseCardSkeleton key={`next-skel-${i}`} />
                    ))}
                </div>
              </>
            )}

            {/* Infinite Scroll Trigger */}
            {hasNextPage && !isInitialLoading && !isFilteringLoading && (
              <div className="text-center mt-8 md:mt-12">
                <Button
                  onClick={() => fetchNextPage()}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 md:px-8 py-2 md:py-3 text-sm md:text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                  disabled={isNextPageLoading}
                >
                  {isNextPageLoading
                    ? t("courses.loading")
                    : t("courses.loadMore")}
                </Button>
              </div>
            )}
          </section>

          {courses.length === 0 && !isLoading && (
            <section className="text-center px-4">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-50/80 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-10 w-10 md:h-12 md:w-12 text-orange-400" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                  {t("courses.noCourses")}
                </h3>
                <p className="text-gray-600 mb-4 text-sm md:text-base">
                  {hasActiveFilters
                    ? t("courses.tryChangeFilters")
                    : t("courses.noCoursesAvailable")}
                </p>
                {hasActiveFilters && (
                  <Button
                    onClick={clearFilters}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
                  >
                    {t("courses.clearFilters")}
                  </Button>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}
