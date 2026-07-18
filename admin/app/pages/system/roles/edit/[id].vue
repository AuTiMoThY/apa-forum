<script setup lang="ts">
definePageMeta({
    middleware: ["auth", "permission"]
});

const title = "編輯角色";
useSeoMeta({
    title
});

const mode = "edit";
const route = useRoute();
const { fetchById } = await useRole();
const data = ref<any>(null);
onMounted(async () => {
    data.value = await fetchById(Number(route.params.id));
    console.log("data", data.value);
});
</script>
<template>
    <RoleFormPage :mode="mode" :data="data" :title="title" />
</template>
