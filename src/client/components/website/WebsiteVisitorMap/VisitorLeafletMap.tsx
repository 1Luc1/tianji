import React from 'react';
import { AppRouterOutput } from '../../../api/trpc';
import { MapContainer, CircleMarker, Popup, TileLayer } from 'react-leaflet';
import { mapCenter } from './utils';
import 'leaflet/dist/leaflet.css';
import './VisitorLeafletMap.css';
import { useTranslation } from '@i18next-toolkit/react';

export const UserDataPoint: React.FC<{
  longitude: number;
  latitude: number;
  count: number;
}> = React.memo((props) => {
  const { t } = useTranslation();

  return (
    <CircleMarker
      center={{
        lat: props.latitude,
        lng: props.longitude,
      }}
      radius={5}
      stroke={false}
      fill={true}
      fillColor="rgb(236,112,20)"
      fillOpacity={0.8}
    >
      <Popup>
        {t('{{num}} users', {
          num: props.count,
        })}
      </Popup>
    </CircleMarker>
  );
});
UserDataPoint.displayName = 'UserDataPoint';

export const VisitorLeafletMap: React.FC<{
  data: AppRouterOutput['website']['geoStats'];
}> = React.memo((props) => {
  return (
    <MapContainer
      className="h-[60vh] w-full"
      center={mapCenter}
      zoom={2}
      minZoom={2}
      maxZoom={10}
      scrollWheelZoom={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {props.data.map((item) => (
        <UserDataPoint key={`${item.longitude},${item.latitude}`} {...item} />
      ))}
    </MapContainer>
  );
});
VisitorLeafletMap.displayName = 'VisitorLeafletMap';
