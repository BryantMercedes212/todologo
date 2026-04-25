import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '../constants/data';

export const useLocation = () => {
  const [location, setLocation] = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { requestLocation(); }, []);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso denegado');
        setLocation({ ...DEFAULT_LOCATION, isDefault: true });
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, isDefault: false });
    } catch (err) {
      setError(err.message);
      setLocation({ ...DEFAULT_LOCATION, isDefault: true });
    }
    setLoading(false);
  };

  return { location, error, loading, refresh: requestLocation };
};
