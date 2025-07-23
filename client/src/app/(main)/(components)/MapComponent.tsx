import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsService,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";

type LatLngLiteral = google.maps.LatLngLiteral;

interface MapComponentProps {
  origin: LatLngLiteral;
  destination: LatLngLiteral;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const MapComponent: React.FC<MapComponentProps> = ({ origin, destination }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [requestDirections, setRequestDirections] = useState<boolean>(false);
  const [originAddress, setOriginAddress] = useState<string>("");

  const center: LatLngLiteral = {
    lat: origin.lat,
    lng: origin.lng,
  };

  useEffect(() => {
    if (origin && destination) {
      setRequestDirections(true);
    }
  }, [origin, destination]);

  useEffect(() => {
    if (!isLoaded || !origin.lat || !origin.lng) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { location: { lat: origin.lat, lng: origin.lng } },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const components = results[0].address_components;

          const area = components.find(
            (c) =>
              c.types.includes("sublocality") ||
              c.types.includes("locality") ||
              c.types.includes("neighborhood")
          )?.long_name;

          const state = components.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name;

          const postalCode = components.find((c) =>
            c.types.includes("postal_code")
          )?.long_name;

          const formattedAddress = [area, state, postalCode]
            .filter(Boolean)
            .join(", ");

          setOriginAddress(formattedAddress || "Address details not found");
        } else {
          setOriginAddress("Address not found");
        }
      }
    );
  }, [origin, isLoaded]);

  const handleDirectionsCallback = (
    result: google.maps.DirectionsResult | null,
    status: google.maps.DirectionsStatus
  ) => {
    if (status === "OK" && result) {
      setDirections(result);

      const route = result.routes[0];
      if (route?.legs?.length > 0) {
        const leg = route.legs[0];
        setDistance(leg.distance?.text || "");
        setDuration(leg.duration?.text || "");
      }

      setRequestDirections(false);
    } else {
      console.error("Directions request failed due to", status);
      setRequestDirections(false);
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <>
      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={7}>
        <Marker position={origin} label="Origin" />
        <Marker position={destination} label="Destination" />

        {requestDirections && (
          <DirectionsService
            options={{
              origin,
              destination,
              travelMode: google.maps.TravelMode.DRIVING,
            }}
            callback={handleDirectionsCallback}
          />
        )}

        {directions && <DirectionsRenderer options={{ directions }} />}
      </GoogleMap>

      <div style={{ marginTop: "10px" }}>
        <div className="bg-white rounded-md p-1 px-2 shadow-neutral-300 shadow-md flex justify-between">
          <p>
            Current Location : <b>{originAddress || "Loading..."}</b>
          </p>
          {distance && duration && (
            <>
              <p>
                Distance to Drive : <b>{distance}</b>
              </p>
              <p>
                Est Time to Reach : <b>{duration}</b>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MapComponent;
