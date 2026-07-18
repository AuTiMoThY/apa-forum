<script setup lang="ts">
import { TextStyle, Color } from "@tiptap/extension-text-style";

const props = withDefaults(
    defineProps<{
        modelValue: string;
    }>(),
    {
        modelValue: ""
    }
);

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

const editor = useEditor({
    content: props.modelValue,
    extensions: [
        TiptapStarterKit.configure({
            // 只保留段落與基本格式，不要標題/程式碼塊等
            heading: false,
            codeBlock: false,
            blockquote: false,
            horizontalRule: false
        }),
        TextStyle,
        Color
    ],
    onUpdate: ({ editor }) => {
        emit("update:modelValue", editor.getHTML());
    }
});

const textColor = ref<string>("#000000");

const updateColorFromEditor = () => {
    if (!editor.value) return;
    const currentColor = editor.value.getAttributes("textStyle").color;
    if (currentColor && currentColor !== textColor.value) {
        textColor.value = currentColor;
    } else if (!currentColor && textColor.value !== "#000000") {
        textColor.value = "#000000";
    }
};

watch(
    () => editor.value,
    (editorInstance) => {
        if (editorInstance) {
            updateColorFromEditor();
            editorInstance.on("selectionUpdate", () => {
                updateColorFromEditor();
            });
        }
    },
    { immediate: true }
);

watch(textColor, (newColor) => {
    if (editor.value && newColor) {
        const currentColor = editor.value.getAttributes("textStyle").color;
        if (currentColor !== newColor) {
            editor.value.chain().setColor(newColor).run();
        }
    }
});

watch(
    () => props.modelValue,
    (newValue) => {
        if (editor.value && editor.value.getHTML() !== newValue) {
            editor.value.commands.setContent(newValue, { emitUpdate: false });
        }
    }
);

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy();
    }
});
</script>

<template>
    <div class="tiptap-editor-simple">
        <div
            v-if="editor"
            class="toolbar border-b border-gray-200 p-2 flex flex-wrap gap-1">
            <UPopover>
                <UTooltip text="文字顏色">
                    <UButton
                        icon="i-lucide-palette"
                        variant="ghost"
                        size="xs"
                        color="neutral"
                        :style="{ color: textColor }" />
                </UTooltip>
                <template #content="{ close }">
                    <div class="relative">
                        <UButton
                            color="neutral"
                            variant="ghost"
                            icon="i-lucide-x"
                            size="xs"
                            class="absolute top-2 right-2 z-10"
                            @click="close" />
                        <color-picker
                            v-model="textColor"
                            class="p-4 pt-10"
                            @change="console.log('New color:', $event)"
                            @close="console.log('ColorPicker is closed')">
                            <color-picker-block
                                v-model="textColor"
                                withHexInput
                                style="--colorPickerShadowOut: none;"
                                @change="console.log('New color:', $event)" />
                        </color-picker>
                    </div>
                </template>
            </UPopover>
            <div class="w-px h-6 bg-gray-300 mx-1" />
            <UTooltip text="粗體">
                <UButton
                    icon="i-lucide-bold"
                    variant="ghost"
                    size="xs"
                    :color="editor.isActive('bold') ? 'primary' : 'neutral'"
                    :disabled="!editor.can().chain().focus().toggleBold().run()"
                    @click="editor.chain().focus().toggleBold().run()" />
            </UTooltip>
            <UTooltip text="斜體">
                <UButton
                    icon="i-lucide-italic"
                    variant="ghost"
                    size="xs"
                    :color="editor.isActive('italic') ? 'primary' : 'neutral'"
                    :disabled="
                        !editor.can().chain().focus().toggleItalic().run()
                    "
                    @click="editor.chain().focus().toggleItalic().run()" />
            </UTooltip>
            <UTooltip text="清除格式">
                <UButton
                    icon="i-lucide-eraser"
                    variant="ghost"
                    size="xs"
                    color="neutral"
                    @click="editor.chain().focus().unsetAllMarks().run()" />
            </UTooltip>
        </div>
        <div class="editor-content prose-content">
            <TiptapEditorContent :editor="editor" />
        </div>
    </div>
</template>

<style scoped>
@reference '~/assets/css/main.css';

.tiptap-editor-simple {
    @apply border border-gray-300 rounded-lg overflow-hidden;
}

.editor-content :deep(.ProseMirror) {
    @apply p-3 min-h-[80px] outline-none;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
    @apply text-gray-400;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
}
</style>
