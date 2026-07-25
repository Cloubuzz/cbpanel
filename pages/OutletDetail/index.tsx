import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  Clock,
  Truck,
  DollarSign,
  Map as MapIcon,
  Store,
  Info,
  Layers,
  X,
  FileSpreadsheet,
  Download,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { fetchOutletDetail, fetchDeliveryAreas, uploadDeliveryAreas, fetchOutletPolygon, uploadOutletPolygon, fetchOutletList, OutletListItem, saveOutlet } from '../../services/outletsApi';
import { asText } from '../../lib/apiValue';

interface DeliveryArea {
  id: string;
  name: string;
  time: string;
  fee: number;
  isActive: boolean;
  polygon?: { lat: number; lng: number }[];
}

interface OutletDetailProps {
  onBack: () => void;
  outletId?: string;
}

export const OutletDetail: React.FC<OutletDetailProps> = ({ onBack, outletId }) => {
  const isEdit = !!outletId;
  const token = useAppSelector(selectToken);

  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [geoCode, setGeoCode] = useState('');

  const [city, setCity] = useState('');
  const [deliveryFees, setDeliveryFees] = useState(0);
  const [deliveryMinimum, setDeliveryMinimum] = useState(0);
  const [deliveryTax, setDeliveryTax] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState(30);
  const [weekdayOpen, setWeekdayOpen] = useState('02');
  const [weekdayClose, setWeekdayClose] = useState('22');
  const [weekendOpen, setWeekendOpen] = useState('02');
  const [weekendClose, setWeekendClose] = useState('22');
  const [openDays, setOpenDays] = useState<string[]>(['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']);
  const [takeAway, setTakeAway] = useState(true);
  const [delivery, setDelivery] = useState(true);
  const [megnusID, setMegnusID] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delivery Areas State
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
  const [isUploadingAreas, setIsUploadingAreas] = useState(false);

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSavingPolygon, setIsSavingPolygon] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [outlets, setOutlets] = useState<OutletListItem[]>([]);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  const [modifiedOutletIds, setModifiedOutletIds] = useState<Set<string>>(new Set());
  const [allPolygons, setAllPolygons] = useState<Record<string, [number, number, number][]>>({});
  const [comparisonSearchText, setComparisonSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const loadDeliveryAreasData = async () => {
    if (!token || !outletId) return;
    try {
      const areas = await fetchDeliveryAreas(token, outletId);
      setDeliveryAreas(areas.map(a => ({
        id: String(a.ID),
        name: a.Area || a.Name,
        time: String(a.DeliveryTime),
        fee: a.DeliveryFee,
        isActive: a.onHold === 0,
      })));
    } catch (error) {
      console.error('Failed to load delivery areas:', error);
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token || !outletId) return;

    setIsUploadingAreas(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const arrayBuffer = evt.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('Failed to read file buffer.');
        }
        const data = new Uint8Array(arrayBuffer);
        const XLSX = await import('xlsx');
        const wb = XLSX.read(data, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        if (!Array.isArray(rawData) || rawData.length === 0) {
          alert('Excel sheet is empty.');
          setIsUploadingAreas(false);
          return;
        }

        const parsedAreas = rawData.map((row: any) => {
          const areaVal = row.Area || row.area || row.AREA || row.Name || row.name || '';
          const minOrder = Number(row.MinimumOrder ?? row.minimumOrder ?? row.Minimum_Order ?? row.minOrder ?? row.Minimum ?? row.minimum ?? 299);
          const delFee = Number(row.DeliveryFee ?? row.deliveryFee ?? row.Delivery_Fee ?? row.fee ?? row.DeliveryFe ?? row.deliveryfe ?? 0);
          const delTime = Number(row.DeliveryTime ?? row.deliveryTime ?? row.Delivery_Time ?? row.time ?? row.DeliveryTi ?? row.deliveryti ?? 30);
          const discount = Number(row.Discount ?? row.discount ?? 0);
          const startTime = String(row.startTime ?? row.StartTime ?? row.start_time ?? row.Start_Time ?? '0:00');
          const endTime = String(row.endTime ?? row.EndTime ?? row.end_time ?? '0:00');
          const onHold = Number(row.onHold ?? row.OnHold ?? row.on_hold ?? row.On_Hold ?? 0);
          const isSponsored = Number(row.IsSponsored ?? row.isSponsored ?? row.IsSponsor ?? row.isSponsor ?? 0);
          const nameVal = row.Name ?? row.name ?? row.Area ?? '';
          const citySpecial = row.CitySpecial ?? row.citySpecial ?? row.CitySpecia ?? row.cityspecia ?? row.City ?? row.city ?? '';
          const isBranch = Number(row.IsBranch ?? row.isBranch ?? 0);

          return {
            Area: areaVal,
            MinimumOrder: minOrder,
            DeliveryFee: delFee,
            DeliveryTime: delTime,
            Discount: discount,
            StartTime: startTime,
            EndTime: endTime,
            OnHold: onHold,
            IsSponsored: isSponsored,
            Name: nameVal,
            CitySpecial: citySpecial,
            IsBranch: isBranch
          };
        });

        // Call API to delete old and upload new
        await uploadDeliveryAreas(token, Number(outletId), parsedAreas);
        
        // Reload delivery areas
        await loadDeliveryAreasData();

        alert(`Successfully imported and synced ${parsedAreas.length} delivery areas from Excel!`);
      } catch (err: any) {
        console.error('Error importing Excel file:', err);
        const errMsg = err?.message || 'Ensure file format is valid.';
        alert(`Failed to parse and upload Excel file. Error: ${errMsg}`);
      } finally {
        setIsUploadingAreas(false);
        // Clear file input
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = async () => {
    if (!token || !outletId) return;
    try {
      const rawAreas = await fetchDeliveryAreas(token, outletId);
      const XLSX = await import('xlsx');
      
      const dataToExport = rawAreas.length > 0 ? rawAreas.map((a: any) => ({
        ID: a.ID,
        OutletID: a.OutletID ?? Number(outletId),
        Area: a.Area ?? '',
        Minimum: a.MinimumOrder ?? 299,
        DeliveryFe: a.DeliveryFee ?? 0,
        DeliveryTi: a.DeliveryTime ?? 30,
        Created: a.Created ?? '',
        Modified: a.Modified ?? '',
        Discount: a.Discount ?? 0,
        startTime: a.startTime ?? '0:00',
        endTime: a.endTime ?? '0:00',
        onHold: a.onHold ?? 0,
        IsSponsor: a.IsSponsored ?? 0,
        SponsorEx: a.SponsorExpiry ?? '',
        OriginalID: a.OriginalDeliveryTime ?? 30,
        Name: a.Name ?? '',
        CitySpecia: a.CitySpecial ?? '',
        IsBranch: a.IsBranch ?? 0
      })) : [
        {
          ID: 1,
          OutletID: Number(outletId),
          Area: "Zone A",
          Minimum: 299,
          DeliveryFe: 100,
          DeliveryTi: 30,
          Created: new Date().toISOString().replace('T', ' ').substring(0, 19),
          Modified: new Date().toISOString().replace('T', ' ').substring(0, 19),
          Discount: 0,
          startTime: "0:00",
          endTime: "0:00",
          onHold: 0,
          IsSponsor: 0,
          SponsorEx: new Date().toISOString().replace('T', ' ').substring(0, 19),
          OriginalID: 30,
          Name: "Zone A",
          CitySpecia: "Karachi",
          IsBranch: 0
        }
      ];

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Delivery Areas");
      XLSX.writeFile(wb, `outlet_${outletId}_delivery_areas.xlsx`);
    } catch (err: any) {
      console.error('Error exporting Excel file:', err);
      alert(`Failed to export Excel file. Error: ${err?.message || err}`);
    }
  };

  useEffect(() => {
    const loadOutlet = async () => {
      if (!isEdit || !token || !outletId) return;

      try {
        const outlet = await fetchOutletDetail(token, outletId);
        setName(outlet.name || '');
        setAddress(asText(outlet.address));
        setPhone(asText(outlet.phone));
        setEmail(asText(outlet.email));
        setGeoCode(outlet.geo_code || '');
        setCity(outlet.city || '');
        setDeliveryFees(outlet.delivery_fees || 0);
        setDeliveryMinimum(outlet.delivery_minimum || 0);
        setDeliveryTax(outlet.delivery_tax || 0);
        setDeliveryTime(outlet.delivery_time || 0);
        const wdParts = (outlet.weekday_timing || '02-22').split('-');
        setWeekdayOpen(wdParts[0] || '02');
        setWeekdayClose(wdParts[1] || '22');

        const weParts = (outlet.weekend_timing || '02-22').split('-');
        setWeekendOpen(weParts[0] || '02');
        setWeekendClose(weParts[1] || '22');
        
        const days = outlet.open_days ? outlet.open_days.split(',').map(d => d.trim()).filter(Boolean) : [];
        setOpenDays(days.length > 0 ? days : ['M', 'T', 'W', 'Th', 'F', 'Sa', 'Su']);
        
        const deliveryVal = outlet.delivery === 1 || outlet.is_delivers === 1;
        setDelivery(deliveryVal);
        setTakeAway(outlet.TakeAway === 1);
        setMegnusID(outlet.MegnusID || '');

        // Fetch delivery areas
        await loadDeliveryAreasData();
      } catch (error) {
        console.error('Failed to load outlet detail:', error);
      }
    };

    loadOutlet();
  }, [isEdit, token, outletId]);

  // --- Google Maps & Polygon Logic ---
  const parsePolygonString = (str: string): [number, number, number][] => {
    if (!str) return [];
    const points: [number, number, number][] = [];
    const matches = str.matchAll(/\[\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]/g);
    for (const match of matches) {
      points.push([parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3])]);
    }
    return points;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).google && (window as any).google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCJHhFr3fKtNnw5eNdnO06ka0SVUR6Gmq4&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, []);

  const mapRef = useRef<any>(null);
  const polygonRefs = useRef<Record<string, any>>({});

  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  };

  const getOutletColor = (id: string, isMain: boolean): string => {
    if (isMain) return '#14b8a6'; // Teal for main
    const colors = [
      '#f97316', // Orange
      '#3b82f6', // Blue
      '#a855f7', // Purple
      '#ec4899', // Pink
      '#eab308', // Yellow
      '#06b6d4', // Cyan
      '#ef4444', // Red
      '#6366f1', // Indigo
      '#f43f5e', // Rose
    ];
    const hash = hashCode(id);
    return colors[hash % colors.length];
  };

  // Helper to draw Google Polygon for editing
  const drawOutletPolygon = (targetOutletId: string, points: [number, number, number][], isMain: boolean) => {
    const google = (window as any).google;
    if (!google || !mapRef.current) return;

    if (polygonRefs.current[targetOutletId]) {
      polygonRefs.current[targetOutletId].setMap(null);
      delete polygonRefs.current[targetOutletId];
    }

    if (points.length === 0) return;

    const googlePaths = points.map(p => ({ lat: p[1], lng: p[0] }));
    const color = getOutletColor(targetOutletId, isMain);

    const polygon = new google.maps.Polygon({
      paths: googlePaths,
      editable: true,
      draggable: true,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: color,
      fillOpacity: isMain ? 0.35 : 0.25
    });

    polygon.setMap(mapRef.current);
    polygonRefs.current[targetOutletId] = polygon;

    // Listen to changes in the path
    const path = polygon.getPath();
    const updatePathState = () => {
      const newPoints: [number, number, number][] = [];
      for (let i = 0; i < path.getLength(); i++) {
        const latLng = path.getAt(i);
        newPoints.push([latLng.lng(), latLng.lat(), 0.0]);
      }
      if (newPoints.length > 0) {
        const first = newPoints[0];
        const last = newPoints[newPoints.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          newPoints.push([first[0], first[1], 0.0]);
        }
      }

      setAllPolygons(prev => ({
        ...prev,
        [targetOutletId]: newPoints
      }));

      setModifiedOutletIds(prev => {
        const updated = new Set(prev);
        updated.add(targetOutletId);
        return updated;
      });
    };

    google.maps.event.addListener(path, 'insert_at', updatePathState);
    google.maps.event.addListener(path, 'remove_at', updatePathState);
    google.maps.event.addListener(path, 'set_at', updatePathState);
    google.maps.event.addListener(polygon, 'dragend', updatePathState);
  };

  const handleToggleComparisonOutlet = async (compOutletId: string) => {
    if (selectedComparisonIds.includes(compOutletId)) {
      // Deselecting
      setSelectedComparisonIds(prev => prev.filter(id => id !== compOutletId));

      if (polygonRefs.current[compOutletId]) {
        polygonRefs.current[compOutletId].setMap(null);
        delete polygonRefs.current[compOutletId];
      }

      setAllPolygons(prev => {
        const updated = { ...prev };
        delete updated[compOutletId];
        return updated;
      });

      setModifiedOutletIds(prev => {
        const updated = new Set(prev);
        updated.delete(compOutletId);
        return updated;
      });
    } else {
      // Selecting
      setSelectedComparisonIds(prev => [...prev, compOutletId]);

      if (!token) return;

      try {
        const polyData = await fetchOutletPolygon(token, compOutletId);
        if (polyData && polyData.Polygon) {
          const parsed = parsePolygonString(polyData.Polygon);

          setAllPolygons(prev => ({
            ...prev,
            [compOutletId]: parsed
          }));

          drawOutletPolygon(compOutletId, parsed, false);

          const google = (window as any).google;
          if (google && mapRef.current) {
            const bounds = new google.maps.LatLngBounds();
            Object.values(polygonRefs.current).forEach((poly: any) => {
              poly.getPath().forEach((latLng: any) => bounds.extend(latLng));
            });
            mapRef.current.fitBounds(bounds);
          }
        } else {
          alert('This branch does not have any active delivery polygon.');
        }
      } catch (err) {
        console.error('Error fetching comparison polygon:', err);
      }
    }
  };

  // Load comparison outlets list
  useEffect(() => {
    if (!isMapModalOpen || !token) return;
    const loadOutletsList = async () => {
      try {
        const list = await fetchOutletList(token);
        setOutlets(list);
      } catch (err) {
        console.error('Error fetching outlets list:', err);
      }
    };
    loadOutletsList();
  }, [isMapModalOpen, token]);

  // Fetch initial main polygon on modal open
  useEffect(() => {
    if (!isMapModalOpen || !token || !outletId) return;

    const loadPolygon = async () => {
      try {
        const polyData = await fetchOutletPolygon(token, outletId);
        if (polyData && polyData.Polygon) {
          const parsed = parsePolygonString(polyData.Polygon);
          setAllPolygons(prev => ({
            ...prev,
            [outletId]: parsed
          }));
          if (googleMapsLoaded) {
            setTimeout(() => {
              drawOutletPolygon(outletId, parsed, true);
            }, 100);
          }
        } else {
          setAllPolygons(prev => ({
            ...prev,
            [outletId]: []
          }));
        }
      } catch (err) {
        console.error('Error fetching polygon:', err);
      }
    };

    loadPolygon();
  }, [isMapModalOpen, token, outletId, googleMapsLoaded]);

  // Initialize Map
  useEffect(() => {
    if (!isMapModalOpen || !googleMapsLoaded) {
      if (mapRef.current) {
        Object.values(polygonRefs.current).forEach((poly: any) => poly.setMap(null));
        polygonRefs.current = {};
        mapRef.current = null;
      }
      return;
    }

    const google = (window as any).google;
    if (!google || !google.maps) return;

    const parts = geoCode ? geoCode.split(',') : [];
    let branchLat = 24.905176;
    let branchLng = 67.182713;
    if (parts.length === 2) {
      branchLat = parseFloat(parts[0].trim());
      branchLng = parseFloat(parts[1].trim());
    }

    const mapOptions = {
      center: { lat: branchLat, lng: branchLng },
      zoom: 13,
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
    };

    const mapDiv = document.getElementById('google-map');
    if (!mapDiv) return;

    const map = new google.maps.Map(mapDiv, mapOptions);
    mapRef.current = map;

    new google.maps.Marker({
      position: { lat: branchLat, lng: branchLng },
      map: map,
      title: 'Branch Location',
      icon: {
        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        fillColor: '#14b8a6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 6
      }
    });

    Object.entries(allPolygons).forEach(([id, points]) => {
      drawOutletPolygon(id, points, id === outletId);
    });
  }, [isMapModalOpen, googleMapsLoaded, geoCode]);

  const handleGenerate5kmRadius = () => {
    const parts = geoCode ? geoCode.split(',') : [];
    let branchLat = 24.905176;
    let branchLng = 67.182713;
    if (parts.length === 2) {
      branchLat = parseFloat(parts[0].trim());
      branchLng = parseFloat(parts[1].trim());
    }

    const points: [number, number, number][] = [];
    const R_EARTH = 6378137;
    const distance = 5000;
    const numPoints = 16;

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 360) / numPoints;
      const angleRad = (angle * Math.PI) / 180;

      const dLat = (distance * Math.cos(angleRad)) / R_EARTH;
      const dLng = (distance * Math.sin(angleRad)) / (R_EARTH * Math.cos((branchLat * Math.PI) / 180));

      const pointLat = branchLat + (dLat * 180) / Math.PI;
      const pointLng = branchLng + (dLng * 180) / Math.PI;
      points.push([pointLng, pointLat, 0.0]);
    }

    const closedPoints = [...points, [points[0][0], points[0][1], 0.0]] as [number, number, number][];
    
    setAllPolygons(prev => ({
      ...prev,
      [outletId!]: closedPoints
    }));

    setModifiedOutletIds(prev => {
      const updated = new Set(prev);
      updated.add(outletId!);
      return updated;
    });

    if (mapRef.current) {
      mapRef.current.setCenter({ lat: branchLat, lng: branchLng });
      mapRef.current.setZoom(12);
    }

    drawOutletPolygon(outletId!, closedPoints, true);
  };

  const handleSavePolygon = async () => {
    if (!token || !outletId) {
      alert('Authentication token or Outlet ID is missing.');
      return;
    }

    if (modifiedOutletIds.size === 0) {
      alert('No polygons have been modified.');
      return;
    }

    setIsSavingPolygon(true);
    try {
      const savePromises = Array.from(modifiedOutletIds).map(async (id) => {
        const points = allPolygons[id];
        if (!points || points.length === 0) return;

        const polygonString = points.map(p => `[ ${p[0]}, ${p[1]}, ${p[2]} ]`).join(', ');
        
        let targetName = name || 'Main Boundary';
        if (id !== outletId) {
          const compOutlet = outlets.find(o => o.id.toString() === id);
          if (compOutlet) {
            targetName = compOutlet.name;
          }
        }

        await uploadOutletPolygon(token, id, targetName, polygonString);
      });

      await Promise.all(savePromises);
      alert('All modified polygons saved successfully.');
      setIsMapModalOpen(false);
      setModifiedOutletIds(new Set());
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Failed to save polygons.');
    } finally {
      setIsSavingPolygon(false);
    }
  };

  const HOUR_OPTIONS = Array.from({ length: 24 }).map((_, i) => {
    const value = i.toString().padStart(2, '0');
    const hour12 = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return {
      value,
      label: `${hour12.toString().padStart(2, '0')}:00 ${ampm}`
    };
  });



  const handleSave = async () => {
    if (!token) return;
    if (!name.trim()) {
      alert('Please enter outlet name.');
      return;
    }
    if (!city.trim()) {
      alert('Please enter city.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: isEdit ? Number(outletId) : undefined,
        name,
        city,
        phone,
        address,
        email,
        geoCode,
        deliveryFees: Number(deliveryFees),
        deliveryMinimum: Number(deliveryMinimum),
        deliveryTax: Number(deliveryTax),
        deliveryTime: Number(deliveryTime),
        weekdayTiming: `${weekdayOpen}-${weekdayClose}`,
        weekendTiming: `${weekendOpen}-${weekendClose}`,
        openDays: openDays.join(','),
        isDelivers: delivery,
        takeAway,
        delivery: delivery,
        megnusID: megnusID
      };

      await saveOutlet(token, payload);
      alert('Outlet saved successfully.');
      onBack();
    } catch (error: any) {
      console.error('Failed to save outlet:', error);
      alert(error.message || 'Failed to save outlet.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1200px] mx-auto">

      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Edit Outlet' : 'Add New Outlet'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit ? `Managing ID: ${outletId}` : 'Configure your new restaurant location'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-8">

          {/* Basic Information Section */}
          <section className="glass-card rounded-[32px] p-8 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg">
                <Info size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
            </div>

            {/* General Info Sub-group */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-teal-500 uppercase tracking-wider">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Outlet Name</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Downtown Central"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Karachi"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 000 000 0000"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Code</label>
                  <div className="relative">
                    <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={megnusID}
                      onChange={(e) => setMegnusID(e.target.value)}
                      placeholder="e.g. MEG-101"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Full street address, city, state"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Geocode (Latitude, Longitude)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      value={geoCode}
                      onChange={(e) => setGeoCode(e.target.value)}
                      placeholder="e.g. 24.8607, 67.0011"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Sub-group */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <h3 className="text-xs font-bold text-teal-500 uppercase tracking-wider">Delivery & Tax Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Fees</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={deliveryFees}
                      onChange={(e) => setDeliveryFees(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Minimum</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={deliveryMinimum}
                      onChange={(e) => setDeliveryMinimum(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Tax (%)</label>
                  <div className="relative">
                    <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      value={deliveryTax}
                      onChange={(e) => setDeliveryTax(Number(e.target.value))}
                      placeholder="0"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Time (minutes)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(Number(e.target.value))}
                      placeholder="30"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Times Sub-group */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/50">
              <h3 className="text-xs font-bold text-teal-500 uppercase tracking-wider">Timings & Open Days</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weekday Timing</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={weekdayOpen}
                        onChange={(e) => setWeekdayOpen(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white appearance-none"
                      >
                        {HOUR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} (Open)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <span className="text-slate-400 text-xs">to</span>
                    <div className="relative flex-1">
                      <select
                        value={weekdayClose}
                        onChange={(e) => setWeekdayClose(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white appearance-none"
                      >
                        {HOUR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} (Close)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weekend Timing</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <select
                        value={weekendOpen}
                        onChange={(e) => setWeekendOpen(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white appearance-none"
                      >
                        {HOUR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} (Open)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                    <span className="text-slate-400 text-xs">to</span>
                    <div className="relative flex-1">
                      <select
                        value={weekendClose}
                        onChange={(e) => setWeekendClose(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white appearance-none"
                      >
                        {HOUR_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label} (Close)
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Open Days</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Mon (M)', value: 'M' },
                      { label: 'Tue (T)', value: 'T' },
                      { label: 'Wed (W)', value: 'W' },
                      { label: 'Thu (Th)', value: 'Th' },
                      { label: 'Fri (F)', value: 'F' },
                      { label: 'Sat (Sa)', value: 'Sa' },
                      { label: 'Sun (Su)', value: 'Su' },
                    ].map((d) => {
                      const isActiveDay = openDays.includes(d.value);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => {
                            if (isActiveDay) {
                              setOpenDays(openDays.filter((day) => day !== d.value));
                            } else {
                              setOpenDays([...openDays, d.value]);
                            }
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            isActiveDay
                              ? 'bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Areas Section */}
          <section className="glass-card rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Truck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Areas</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Define zones, times, and fees</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isEdit && (
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/20 transition-all border border-amber-200/50 dark:border-amber-900/50"
                  >
                    <Download size={14} />
                    <span>{deliveryAreas.length > 0 ? 'Export Areas' : 'Download Template'}</span>
                  </button>
                )}

                {isEdit && (
                  <label className={`flex items-center gap-2 px-4 py-2.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-bold hover:bg-teal-500/20 transition-all border border-teal-200/50 dark:border-teal-900/50 cursor-pointer ${isUploadingAreas ? 'opacity-50 pointer-events-none' : ''}`}>
                    <FileSpreadsheet size={14} />
                    <span>{isUploadingAreas ? 'Uploading...' : 'Import Excel'}</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleExcelImport}
                      className="hidden"
                      disabled={isUploadingAreas}
                    />
                  </label>
                )}

                <button
                  onClick={() => {
                    setIsMapModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all border border-blue-200/50 dark:border-blue-900/50"
                >
                  <MapIcon size={14} />
                  View Delivery Map
                </button>
              </div>
            </div>

            {/* Area Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <div className="col-span-3">Area Name</div>
              <div className="col-span-3">Delivery Time</div>
              <div className="col-span-3">Fee ($)</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <div className="space-y-3 relative">
              {isUploadingAreas && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <div className="flex flex-col items-center gap-2 text-teal-500">
                    <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    <span className="text-xs font-bold">Uploading & syncing areas...</span>
                  </div>
                </div>
              )}
              <AnimatePresence initial={false}>
                {deliveryAreas.map((area) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:border-teal-500/30 transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3">
                        <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Area Name</label>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 px-1">
                          {area.name || 'Unnamed Area'}
                        </span>
                      </div>
                      <div className="md:col-span-3">
                        <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Time (min)</label>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-1 text-sm">
                          <Clock className="text-slate-400" size={14} />
                          <span>{area.time} min</span>
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fee</label>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 px-1 text-sm">
                          <DollarSign className="text-teal-500" size={14} />
                          <span>{area.fee}</span>
                        </div>
                      </div>
                      <div className="md:col-span-3 flex items-center justify-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          area.isActive 
                            ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                          {area.isActive ? 'Active' : 'On Hold'}
                        </span>
                        <button
                          onClick={() => {
                            setIsMapModalOpen(true);
                          }}
                          title="Draw/View Polygon Map"
                          className="p-2 rounded-xl text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                        >
                          <Layers size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {deliveryAreas.length === 0 && (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
                  <Truck size={36} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold">No delivery areas configured.</p>
                  <p className="text-xs text-slate-500 mt-1">Upload an Excel file to sync delivery zones.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Settings */}
        <div className="space-y-8">

          {/* Status & Visibility */}
          <section className="glass-card rounded-[32px] p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Status & Visibility</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Delivery Service</p>
                  <p className="text-[10px] text-slate-500">Supports delivery & delivers service</p>
                </div>
                <button
                  onClick={() => {
                    const newVal = !delivery;
                    setDelivery(newVal);
                  }}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${delivery ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div
                    animate={{ x: delivery ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Takeaway</p>
                  <p className="text-[10px] text-slate-500">Supports takeaway service</p>
                </div>
                <button
                  onClick={() => setTakeAway(!takeAway)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${takeAway ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div
                    animate={{ x: takeAway ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Map Polygon Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <MapIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      Delivery Area Map View
                    </h2>
                    <p className="text-xs text-slate-500">Edit and save boundary zones for this outlet</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Searchable Dropdown for Comparison Outlets */}
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-800"
                    >
                      <span>Compare Branches ({selectedComparisonIds.length})</span>
                      <ChevronDown size={14} />
                    </button>
                    {showDropdown && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                        <div className="absolute right-0 mt-2 w-80 max-h-72 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-20 p-3 flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Search branch..."
                            value={comparisonSearchText}
                            onChange={(e) => setComparisonSearchText(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                          />
                          <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto pr-1">
                            {outlets
                              .filter(o => o.id.toString() !== outletId && o.name.toLowerCase().includes(comparisonSearchText.toLowerCase()))
                              .map(o => {
                                const isChecked = selectedComparisonIds.includes(o.id.toString());
                                return (
                                  <label
                                    key={o.id}
                                    className="flex items-center gap-3 px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors font-medium cursor-pointer rounded-lg"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleComparisonOutlet(o.id.toString())}
                                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                                    />
                                    <span>{o.name}</span>
                                  </label>
                                );
                              })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={handleGenerate5kmRadius}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition-all shadow-md shadow-teal-900/10"
                  >
                    <Layers size={14} />
                    Generate 5km Radius
                  </button>
                  <button
                    onClick={() => setIsMapModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Map Content */}
              <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
                {!googleMapsLoaded ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-2 text-teal-500">
                      <div className="w-8 h-8 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                      <span className="text-xs font-bold">Loading interactive map...</span>
                    </div>
                  </div>
                ) : (
                  <div id="google-map" className="w-full h-full z-0" />
                )}

                <div className="absolute top-8 left-8 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg max-w-xs z-[1000] pointer-events-none">
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                     <Info size={14} className="text-blue-500" />
                     Boundary Editor Instructions
                   </h3>
                   <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-4">
                     <li>Click <strong>Generate 5km Radius</strong> to draw a starting delivery circle.</li>
                     <li>Drag any teal/orange handle to modify the delivery zones.</li>
                     <li>Comparison branch edits will be saved automatically upon saving.</li>
                   </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="text-xs text-slate-500">
                   Geocode Center: <span className="font-bold text-slate-900 dark:text-white">{geoCode || 'Not Set'}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsMapModalOpen(false)}
                    disabled={isSavingPolygon}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Discard
                  </button>
                  <button
                    onClick={handleSavePolygon}
                    disabled={isSavingPolygon}
                    className="px-8 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSavingPolygon ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Polygon'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
