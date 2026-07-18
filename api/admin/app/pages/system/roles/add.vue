<script setup lang="ts">
definePageMeta({
    middleware: ["auth", "permission"]
});

const title = "新增角色";
useSeoMeta({
    title
});

const mode = "add";
const { data } = useRole();
</script>
<template>
    <RoleFormPage :mode="mode" :data="data" :title="title" />
</template>
