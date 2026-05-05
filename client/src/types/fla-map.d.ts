interface FlaMapEntry {
  name: string;
  shortname: string;
  comment: string;
  link: string | null;
  color: string | null;
  colorOver: string | null;
  nameColor?: string | null;
  nameColorOver?: string | null;
  nameFontSize?: string | null;
  isNewWindow?: boolean | null;
}

interface FlaMapConfig {
  mapWidth: string | number;
  mapHeight: number;
  isNewWindow: boolean;
  iPhoneLink: boolean;
  borderColor: string;
  borderColorOver: string;
  map_data: Record<string, FlaMapEntry>;
  [key: string]: unknown;
}

interface FlaMapInstance {
  drawOnDomReady(containerId: string, callback?: () => void): void;
  on(
    event: "click" | "dblclick" | "mousein" | "mouseout" | "mousemove" | "mousedown" | "mouseup",
    callback: (ev: MouseEvent, sid: string, map: FlaMapInstance) => void
  ): void;
  fetchStateAttr(sid: string, attr: string): unknown;
  setStateAttr(sid: string, cfg: Partial<FlaMapEntry>): void;
  mapConfig: FlaMapConfig;
}

declare global {
  interface Window {
    map_cfg: FlaMapConfig;
    FlaMap: new (cfg: FlaMapConfig) => FlaMapInstance;
  }
}
