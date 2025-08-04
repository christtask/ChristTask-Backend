export interface QuranVerseData {
    surah: number;
    ayah: number;
    text: string;
    translation: string;
    juz: number;
    revelation: 'Meccan' | 'Medinan';
    category?: 'violence' | 'women' | 'trinity' | 'creation' | 'salvation' | 'contradiction';
    problematic?: boolean;
    notes?: string;
}
export declare const quranVerses: QuranVerseData[];
export default quranVerses;
//# sourceMappingURL=quranVerses.d.ts.map