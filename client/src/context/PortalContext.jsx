
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../services/api";

const PortalContext = createContext(null);

const empty = {
  settings: null,
  regions: [],
  departments: [],
  modules: [],
  highlights: [],
  events: [],
  meetings: [],
  documents: [],
  directory: [],
  gallery: [],
  organogram: [],
  keyFigures: [],
};

const REGION_KEY = "gail_portal_region";

const slug = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// All six approved regions
const CANONICAL_REGIONS = [
  { id: "jaipur", name: "Jaipur", nameHi: "जयपुर" },
  { id: "jamnagar", name: "Jamnagar", nameHi: "जामनगर" },
  { id: "samakhali", name: "Samakhali", nameHi: "समाखियाली" },
  { id: "nasirabad", name: "Nasirabad", nameHi: "नसीराबाद" },
  { id: "aburoad", name: "AbuRoad", nameHi: "आबू रोड" },
  { id: "mansarampura", name: "Mansarampura", nameHi: "मनसारामपुरा" },
];

const REGION_IDS = CANONICAL_REGIONS.map((region) => region.id);

const isJaipur = (region) =>
  slug(region?.id) === "jaipur" ||
  slug(region?.name) === "jaipur";

// Merge API data with all six canonical regions
const mergeRegions = (apiRegions = []) => {
  const byId = new Map(
    apiRegions.map((region) => [slug(region.id), region])
  );

  return CANONICAL_REGIONS.map((fallback) => ({
    ...fallback,
    ...(byId.get(fallback.id) || {}),
    pipelines: byId.get(fallback.id)?.pipelines || [],
  }));
};

export function PortalProvider({ children }) {
  const [data, setData] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Jaipur is default, but all six regions are valid saved selections
  const [selectedRegionId, setSelectedRegionState] = useState(() => {
    try {
      const saved = slug(localStorage.getItem(REGION_KEY) || "");

      const initialRegion = REGION_IDS.includes(saved)
        ? saved
        : "jaipur";

      localStorage.setItem(REGION_KEY, initialRegion);

      return initialRegion;
    } catch {
      return "jaipur";
    }
  });

  // Change the global region throughout the website
  const setSelectedRegion = useCallback((id) => {
    const next = slug(id || "jaipur");

    const validRegion = REGION_IDS.includes(next)
      ? next
      : "jaipur";

    setSelectedRegionState(validRegion);

    try {
      localStorage.setItem(REGION_KEY, validRegion);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Fetch portal data
  const refresh = async () => {
    try {
      const response = await api.get("/portal");

      setData({
        ...empty,
        ...response.data,

        // Always expose all six regions
        regions: mergeRegions(response.data.regions || []).map(
          (region) => ({
            ...region,
            pipelines: region.pipelines || [],
            pipelineNames: (region.pipelines || []).map(
              (pipeline) => pipeline.name
            ),
          })
        ),
      });

      setError("");
    } catch (e) {
      setError(
        "Portal data could not be loaded. Check that the API and database are running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();

    const timer = window.setInterval(refresh, 20000);
    const onFocus = () => refresh();

    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Preserve any valid selected region.
  // Only fall back to Jaipur if the saved region is invalid.
  useEffect(() => {
    if (loading || !data.regions.length) return;

    const exact = data.regions.find(
      (region) => region.id === selectedRegionId
    );

    if (exact) return;

    const byName = data.regions.find(
      (region) =>
        slug(region.name) === slug(selectedRegionId)
    );

    if (byName) {
      setSelectedRegion(byName.id);
      return;
    }

    const jaipur = data.regions.find(isJaipur);

    if (jaipur) {
      setSelectedRegion(jaipur.id);
    }
  }, [
    loading,
    selectedRegionId,
    data.regions,
    setSelectedRegion,
  ]);

  // Currently selected region
  const selectedRegion = useMemo(() => {
    return (
      data.regions.find(
        (region) => region.id === selectedRegionId
      ) ||
      data.regions.find(
        (region) =>
          slug(region.name) === slug(selectedRegionId)
      ) ||
      data.regions.find(isJaipur) ||
      data.regions[0] ||
      null
    );
  }, [data.regions, selectedRegionId]);

  // Global region list: all six regions
  const publicRegions = useMemo(
    () => data.regions,
    [data.regions]
  );

  // Check whether content belongs to the selected region.
  // Records without regionId are shared content.
  const inRegion = useCallback(
    (item) =>
      !!selectedRegion &&
      (!item?.regionId ||
        item.regionId === selectedRegion.id),
    [selectedRegion]
  );

  return (
    <PortalContext.Provider
      value={{
        ...data,
        publicRegions,
        loading,
        error,
        refresh,
        selectedRegionId: selectedRegion
          ? selectedRegion.id
          : selectedRegionId,
        selectedRegion,
        setSelectedRegion,
        inRegion,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  return (
    useContext(PortalContext) || {
      ...empty,
      loading: true,
      error: "Portal data provider is not configured",
      refresh: async () => {},
      selectedRegionId: "jaipur",
      selectedRegion: null,
      setSelectedRegion: () => {},
      inRegion: () => true,
    }
  );
}
