import type { ProductRegion } from "~/constants/product";

export const useProductRegion = () => {
    const route = useRoute();
    const router = useRouter();

    const region = ref<ProductRegion>("tw");

    const regionLabel = computed(() => {
        const map: Record<ProductRegion, string> = {
            tw: "台灣",
            sg: "新加坡",
            mm: "緬甸"
        };
        return map[region.value];
    });

    const setRegion = (r: ProductRegion) => {
        region.value = r;
        const query = { ...route.query, region: r };
        router.replace({ path: route.path, query });
    };

    onMounted(() => {
        const q = (route.query.region as string)?.toLowerCase();
        if (q === "tw" || q === "sg" || q === "mm") {
            region.value = q;
        }
    });

    watch(
        () => route.query.region,
        (q) => {
            const r = (q as string)?.toLowerCase();
            if (r === "tw" || r === "sg" || r === "mm") {
                region.value = r;
            }
        }
    );

    return { region, regionLabel, setRegion };
};
