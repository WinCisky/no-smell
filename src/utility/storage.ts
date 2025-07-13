import { MMKV } from "react-native-mmkv";

export async function getKvStorage(): Promise<MMKV> {
    return new MMKV();
}

