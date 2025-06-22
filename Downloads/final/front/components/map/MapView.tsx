"use client";
import React, { useEffect, useRef, useState } from "react";

const GOOGLE_MAPS_API_KEY = "AIzaSyCOMXwDn2UW23UDwQLMfF6yJwEGGN5qghs";
const MAP_ID = "b76e83fc6b95a83628709659"; // Your monochromeDark style ID

// Custom DistanceBlurOverlay class
class DistanceBlurOverlay {
  private div: HTMLDivElement | null = null;
  private center: any;
  private map: any = null;

  constructor(center: any) {
    this.center = center;
  }

  setMap(map: any) {
    // Remove from old map
    if (this.map) {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
      }
      this.div = null;
    }

    // Set new map
    this.map = map;

    // Add to new map
    if (map) {
      this.onAdd();
    }
  }

  onAdd() {
    if (!this.map || !this.map.getDiv) return;

    const mapDiv = this.map.getDiv();
    if (!mapDiv) return;

    this.div = document.createElement("div");
    this.div.style.position = "absolute";
    this.div.style.top = "0";
    this.div.style.left = "0";
    this.div.style.width = "100%";
    this.div.style.height = "100%";
    this.div.style.pointerEvents = "none"; // Don't block mouse events
    this.div.style.zIndex = "1"; // Above the map, below controls

    // Apply radial gradient for fog/blur effect
    this.updateFogEffect();

    mapDiv.appendChild(this.div);
  }

  updateFogEffect() {
    if (!this.div || !this.map) return;

    // Set radial gradient based on center point
    // Now with darker fog at the edges (increased opacity values)
    this.div.style.background = `radial-gradient(
      circle at 50% 50%,
      transparent 0%,
      transparent 20%,
      rgba(0, 0, 0, 0.05) 40%,
      rgba(0, 0, 0, 0.2) 60%,
      rgba(0, 0, 0, 0.45) 80%,
      rgba(0, 0, 0, 0.8) 100%
    )`;
  }

  updateCenter(center: any) {
    this.center = center;
    this.updateFogEffect();
  }
}

const MapView: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const blurOverlayRef = useRef<any>(null);
  const desiredTilt = useRef<number>(80); // Store desired tilt value
  const [searchValue, setSearchValue] = useState<string>(""); // For search input
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store geocoding results
  const geocoderRef = useRef<any>(null);
  const autoRotateInterval = useRef<any>(null);
  const idleTimerRef = useRef<any>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);
  const [isUserLocationMarker, setIsUserLocationMarker] = useState<boolean>(true); // Track if current marker is user's location
  const initialLocationDone = useRef<boolean>(false); // Track if initial location centering is done

  // Create blue pulsing dot marker for user's location
  const createUserLocationMarker = (position: any, mapObj: any) => {
    // Remove existing marker if any
    if (marker) marker.setMap(null);

    // Create a custom marker with a pulsing blue dot
    const userMarker = new (window as any).google.maps.Marker({
      position,
      map: mapObj,
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        scale: 7,
      },
      title: "Your location",
      zIndex: 2, // Ensure it's above other markers
    });

    // Add pulsing effect using CSS animation with a div overlay
    const markerDiv = document.createElement("div");
    markerDiv.className = "location-pulse";
    markerDiv.style.position = "absolute";
    markerDiv.style.width = "24px";
    markerDiv.style.height = "24px";
    markerDiv.style.borderRadius = "50%";
    markerDiv.style.backgroundColor = "rgba(66, 133, 244, 0.2)";
    markerDiv.style.boxShadow = "0 0 0 rgb(66, 133, 244)";
    markerDiv.style.animation = "pulse 1.5s infinite";

    // Add the CSS animation to head
    if (!document.getElementById("location-pulse-style")) {
      const style = document.createElement("style");
      style.id = "location-pulse-style";
      style.textContent = `
        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Create an overlay for the pulse effect
    const pulseOverlay = new (window as any).google.maps.OverlayView();
    pulseOverlay.onAdd = function () {
      const panes = pulseOverlay.getPanes();
      panes.overlayMouseTarget.appendChild(markerDiv);
    };

    pulseOverlay.draw = function () {
      const projection = pulseOverlay.getProjection();
      const point = projection.fromLatLngToDivPixel(position);
      if (point) {
        markerDiv.style.left = point.x - 12 + "px";
        markerDiv.style.top = point.y - 12 + "px";
      }
    };

    pulseOverlay.setMap(mapObj);

    setMarker(userMarker);
    setIsUserLocationMarker(true);

    // Return both marker and overlay so they can be removed together
    return { marker: userMarker, overlay: pulseOverlay };
  };

  // Create standard marker for search results
  const createStandardMarker = (position: any, mapObj: any) => {
    // Remove existing marker if any
    if (marker) marker.setMap(null);

    const newMarker = new (window as any).google.maps.Marker({
      position,
      map: mapObj,
      animation: (window as any).google.maps.Animation.DROP,
    });

    setMarker(newMarker);
    setIsUserLocationMarker(false);
    return newMarker;
  };

  useEffect(() => {
    let script: HTMLScriptElement | null = null;
    let mapInstance: any = null;

    function initMap() {
      // Try geolocation first
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          mapInstance = new (window as any).google.maps.Map(mapRef.current, {
            center: userLocation,
            zoom: 16,
            mapTypeControl: false,
            mapId: MAP_ID, // Always use your style ID
            tilt: desiredTilt.current, // Set default tilt to 80 degrees
            heading: 0,
            mapTypeId: "roadmap",
            colorScheme: (window as any).google.maps.ColorScheme.DARK,
            renderingType: (window as any).google.maps.RenderingType.VECTOR, // Use vector rendering for better quality
            // Enable Street View option
            streetViewControl: true,
            streetViewControlOptions: {
              position: (window as any).google.maps.ControlPosition.RIGHT_BOTTOM,
            },
          });
          setMap(mapInstance);

          // Initialize geocoder
          geocoderRef.current = new (window as any).google.maps.Geocoder();

          // Add blur overlay
          const blurOverlay = new DistanceBlurOverlay(userLocation);
          blurOverlay.setMap(mapInstance);
          blurOverlayRef.current = blurOverlay;

          // Removed BuildingsLayer: not supported in Google Maps JS API

          // Update blur overlay when map moves
          mapInstance.addListener("center_changed", () => {
            blurOverlayRef.current?.updateCenter(mapInstance.getCenter());
          });

          // Maintain tilt when zoom changes
          mapInstance.addListener("zoom_changed", () => {
            // Update blur
            blurOverlayRef.current?.updateCenter(mapInstance.getCenter());

            // Restore tilt - needs a slight delay to override Google's default behavior
            setTimeout(() => {
              if (mapInstance && mapInstance.getTilt() !== desiredTilt.current) {
                mapInstance.setTilt(desiredTilt.current);
              }
            }, 100);
          });

          // Replace the standard marker with our custom user location marker
          createUserLocationMarker(userLocation, mapInstance);

          // Setup idle detection for auto-rotation
          // Changed to listen only for click-based events
          const idleEvents = ["click", "dblclick", "rightclick", "mousedown"];
          idleEvents.forEach((eventName) => {
            mapInstance.addListener(eventName, () => {
              resetIdleTimer();
            });
          });

          // Also listen for drag events
          mapInstance.addListener("dragstart", resetIdleTimer);
          mapInstance.addListener("drag", () => {
            // Only reset during active dragging
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            clearAutoRotation();
            setIsAutoRotating(false);
          });
        },
        () => {
          // Fallback to default location if geolocation fails
          const fallbackLocation = { lat: -34.397, lng: 150.644 };
          mapInstance = new (window as any).google.maps.Map(mapRef.current, {
            center: fallbackLocation,
            zoom: 8,
            mapTypeControl: false,
            mapId: MAP_ID, // Always use your style ID
            tilt: desiredTilt.current,
            heading: 0,
            mapTypeId: "roadmap",
            colorScheme: (window as any).google.maps.ColorScheme.DARK,
            renderingType: (window as any).google.maps.RenderingType.VECTOR, // Use vector rendering for better quality
            // Enable Street View option
            streetViewControl: true,
            streetViewControlOptions: {
              position: (window as any).google.maps.ControlPosition.RIGHT_BOTTOM,
            },
          });
          setMap(mapInstance);

          // Initialize geocoder
          geocoderRef.current = new (window as any).google.maps.Geocoder();

          // Add blur overlay for fallback location too
          const blurOverlay = new DistanceBlurOverlay(fallbackLocation);
          blurOverlay.setMap(mapInstance);
          blurOverlayRef.current = blurOverlay;

          // Removed BuildingsLayer: not supported in Google Maps JS API

          // Update blur overlay when map moves
          mapInstance.addListener("center_changed", () => {
            blurOverlayRef.current?.updateCenter(mapInstance.getCenter());
          });

          // Maintain tilt when zoom changes
          mapInstance.addListener("zoom_changed", () => {
            // Update blur
            blurOverlayRef.current?.updateCenter(mapInstance.getCenter());

            // Restore tilt - needs a slight delay to override Google's default behavior
            setTimeout(() => {
              if (mapInstance && mapInstance.getTilt() !== desiredTilt.current) {
                mapInstance.setTilt(desiredTilt.current);
              }
            }, 100);
          });

          // Setup idle detection for auto-rotation
          // Changed to listen only for click-based events
          const idleEvents = ["click", "dblclick", "rightclick", "mousedown"];
          idleEvents.forEach((eventName) => {
            mapInstance.addListener(eventName, () => {
              resetIdleTimer();
            });
          });

          // Also listen for drag events
          mapInstance.addListener("dragstart", resetIdleTimer);
          mapInstance.addListener("drag", () => {
            // Only reset during active dragging
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            clearAutoRotation();
            setIsAutoRotating(false);
          });
        }
      );
    }

    function onScriptLoad() {
      initMap();
    }

    if ((window as any).google && (window as any).google.maps) {
      onScriptLoad();
    } else {
      script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = onScriptLoad;
      document.body.appendChild(script);
    }

    return () => {
      if (script) document.body.removeChild(script);
      if (blurOverlayRef.current) blurOverlayRef.current.setMap(null);
      clearAutoRotation();
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
    // eslint-disable-next-line
  }, []);

  // Add a specific function to handle entering Street View if needed
  const handleStreetViewChanged = () => {
    // This function would be called when Street View is entered or exited
    const isInStreetView = map?.getStreetView?.()?.getVisible?.() || false;

    if (isInStreetView) {
      // Pause auto-rotation and other effects when in Street View
      clearAutoRotation();
      setIsAutoRotating(false);
    } else {
      // Resume normal map behavior when exiting Street View
      resetIdleTimer();
    }
  };

  // Add the event listener when the map is initialized
  useEffect(() => {
    if (map && map.getStreetView) {
      const streetView = map.getStreetView();
      if (streetView) {
        const listener = streetView.addListener("visible_changed", handleStreetViewChanged);

        return () => {
          // Clean up listener
          (window as any).google.maps.event.removeListener(listener);
        };
      }
    }
  }, [map]);

  // Add a new useEffect that triggers the location button functionality after map is initialized
  useEffect(() => {
    // Only proceed if map is initialized and we haven't done the initial location centering yet
    if (map && !initialLocationDone.current) {
      initialLocationDone.current = true;

      // Slight delay to ensure map is fully loaded
      setTimeout(() => {
        handleMyLocation();
      }, 500);
    }
  }, [map]); // This effect depends on the map being initialized

  // Function to set tilt and track it in ref
  const setMapTilt = (tiltValue: number) => {
    if (map) {
      map.setTilt(tiltValue);
      desiredTilt.current = tiltValue;
    }
  };

  // Reset the idle timer and stop any current rotation
  const resetIdleTimer = () => {
    // Clear any existing timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    clearAutoRotation();
    setIsAutoRotating(false);

    // Set new idle timer
    idleTimerRef.current = setTimeout(() => {
      startAutoRotation();
    }, 700); // Start rotation after 3 seconds of inactivity
  };

  // Start the auto rotation effect
  const startAutoRotation = () => {
    if (!map) return;

    // Set the flag
    setIsAutoRotating(true);

    // Very slow, subtle rotation
    let rotationSpeed = 0.1; // degrees per frame

    autoRotateInterval.current = setInterval(() => {
      if (map) {
        const currentHeading = map.getHeading() || 0;
        map.setHeading(currentHeading + rotationSpeed);
      }
    }, 50); // Update every 50ms for smooth rotation
  };

  // Clear the auto rotation
  const clearAutoRotation = () => {
    if (autoRotateInterval.current) {
      clearInterval(autoRotateInterval.current);
      autoRotateInterval.current = null;
    }
  };

  // When any user interaction happens, reset the idle timer
  // Modified to ignore mouse movement
  const handleMapInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    // Only reset on mousedown/touchstart events, not mousemove
    if (e.type === "mousedown" || e.type === "touchstart") {
      resetIdleTimer();
    }
  };

  // Geolocation and marker logic for button
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        if (map) {
          map.setCenter(userLocation);
          map.setZoom(18); // Using zoom level 18 for close-up view

          // Use the custom blue dot marker for user location
          createUserLocationMarker(userLocation, map);

          // Update blur overlay center
          if (blurOverlayRef.current) {
            blurOverlayRef.current.updateCenter(userLocation);
          }

          // Ensure we maintain tilt after location change
          setTimeout(() => {
            map.setTilt(desiredTilt.current);
          }, 100);

          // Reset idle timer after getting user location
          resetIdleTimer();
        }
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle search submit
  const handleSearch = () => {
    if (!searchValue.trim() || !geocoderRef.current) return;

    geocoderRef.current.geocode({ address: searchValue }, (results: any[], status: string) => {
      if (status === (window as any).google.maps.GeocoderStatus.OK && results.length > 0) {
        setSearchResults(results);
        flyToLocation(results[0].geometry.location);
      } else {
        alert("Location not found");
      }
    });
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fly to location with animation
  const flyToLocation = (location: any) => {
    if (!map) return;

    // Create animated sequence
    const startCenter = map.getCenter();
    const startZoom = map.getZoom();
    const startTilt = map.getTilt();

    const endCenter = location;
    const endZoom = 17; // Target zoom level
    const endTilt = desiredTilt.current;

    // Animate over 1 second (60 frames)
    let step = 0;
    const steps = 60;
    const animationInterval = setInterval(() => {
      step++;

      // Calculate intermediate values
      const progress = step / steps;
      const easedProgress = easeInOutCubic(progress);

      // Interpolate values
      const lat = startCenter.lat() + (endCenter.lat() - startCenter.lat()) * easedProgress;
      const lng = startCenter.lng() + (endCenter.lng() - startCenter.lng()) * easedProgress;
      const zoom = startZoom + (endZoom - startZoom) * easedProgress;
      const tilt = startTilt + (endTilt - startTilt) * easedProgress;

      // Update map
      map.setCenter({ lat, lng });
      map.setZoom(zoom);
      map.setTilt(tilt);

      // Place a marker
      if (step === steps) {
        clearInterval(animationInterval);

        // Use standard marker for search results
        createStandardMarker(endCenter, map);

        // Reset idle timer after animation completes
        resetIdleTimer();
      }
    }, 16); // 60fps
  };

  // Easing function for smoother animation
  const easeInOutCubic = (t: number) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Select search result and fly to it
  const selectSearchResult = (location: any) => {
    flyToLocation(location.geometry.location);
    setSearchResults([]);
    setSearchValue(location.formatted_address);
  };

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      // Remove mousemove handler, keep only mousedown and touch handlers
      onMouseDown={handleMapInteraction}
      onTouchStart={handleMapInteraction}
    >
      <div
        ref={mapRef}
        style={{ width: "100%", height: "100%", borderRadius: "8px" }}
        id="map_canvas"
      />

      {/* Search Bar */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: 500,
            margin: "0 auto",
            position: "relative",
          }}
        >
          <input
            value={searchValue}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search for a place..."
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              borderRadius: "24px",
              border: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              outline: "none",
              backgroundColor: "rgba(255,255,255,0.9)",
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "#4285F4",
              border: "none",
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                backgroundColor: "white",
                borderRadius: "0 0 8px 8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                marginTop: 4,
                maxHeight: 300,
                overflowY: "auto",
                zIndex: 3,
              }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  style={{
                    padding: "10px 16px",
                    borderBottom: index < searchResults.length - 1 ? "1px solid #eee" : "none",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
                >
                  {result.formatted_address}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Location Button */}
      <button
        onClick={handleMyLocation}
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 1,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#fff",
          border: "none",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#4285F4">
          <circle cx="12" cy="12" r="8" fill="#4285F4" />
          <circle cx="12" cy="12" r="3" fill="#fff" />
        </svg>
      </button>

      {/* Optional: Add an indicator when auto-rotation is active */}
      {isAutoRotating && (
        <div
          style={{
            position: "absolute",
            bottom: 70,
            right: 16,
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "4px 8px",
            borderRadius: 16,
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          Auto-rotating
        </div>
      )}
    </div>
  );
};

export default MapView;