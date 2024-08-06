<template>
    <q-page padding>
        <div class="q-pa-md">
            <div class="flex flex-end"></div>
            <div class="flex flex-center">
                <q-checkbox
                    v-model="selected"
                    :val="AnimeListStatuses.planned"
                    label="Запланированы"
                    color="teal" />
                <q-checkbox
                    v-model="selected"
                    :val="AnimeListStatuses.watching"
                    label="Смотрю"
                    color="teal" />
                <q-checkbox
                    v-model="selected"
                    :val="AnimeListStatuses.completed"
                    label="Просмотрено"
                    color="teal" />
                <q-checkbox
                    v-model="selected"
                    :val="AnimeListStatuses.rewatching"
                    label="Пересматриваю"
                    color="teal" />
                <q-checkbox
                    v-model="selected"
                    :val="AnimeListStatuses.dropped"
                    label="Дропнуты"
                    color="teal" />
                <q-checkbox
                    v-model="selected"
                    :val="AnimeListStatuses.on_hold"
                    label="На удержании"
                    color="teal" />
                <div class="flex">
                    <q-btn
                        class="block"
                        @click="setDisplayType('row')"
                        :color="displayType === 'row' ? 'primary' : undefined"
                        icon="view_list" />
                    <q-btn
                        class="block"
                        @click="setDisplayType('grid')"
                        :color="displayType === 'grid' ? 'primary' : undefined"
                        icon="grid_view" />
                </div>
            </div>
            <q-infinite-scroll
                style="width: 75%; margin: 0 auto"
                ref="infScroll"
                @load="loadList"
                :offset="250"
                :class="{ grid: displayType === 'grid', flex: displayType === 'row' }">
                <watch-list-entry
                    @delete="deleteItem"
                    v-for="entry in watchListStore.watchList"
                    :key="entry.id"
                    :entry="entry"
                    :type="displayType" />
                <template v-slot:loading>
                    <div class="row justify-center q-my-md">
                        <q-spinner-dots color="primary" size="40px" />
                    </div>
                </template>
            </q-infinite-scroll>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { QInfiniteScroll } from 'quasar';
import { AnimeListStatuses } from 'src/components/models';
import WatchListEntry from 'src/components/watch-list/WatchListEntry.vue';
import { useWatchListStore } from 'src/stores/watch-list-store';
import { ref, watch } from 'vue';

defineOptions({
    name: 'WatchList',
    async preFetch({ store }) {
        const $store = useWatchListStore(store);
        await $store.getWatchList();
    },
});

const watchListStore = useWatchListStore();

const infScroll = ref<QInfiniteScroll>();
const selected = ref<AnimeListStatuses[]>([]);

const displayType = ref('grid');

function setDisplayType(type: string) {
    displayType.value = type;
}

watch(
    selected,
    async () => {
        if (typeof infScroll.value === 'undefined') return;
        await watchListStore.getWatchList(selected.value);
        infScroll.value.reset();
    },
    { deep: true },
);

async function loadList(index: number, done: (stop: boolean) => void) {
    await watchListStore.appendWatchList(index + 1, selected.value);
    const isFinished = watchListStore.listCount === watchListStore.watchList.length;
    done(isFinished);
}

function deleteItem(id: number) {
    watchListStore.api.delete(`/watch-list/${id}`);
    watchListStore.watchList = watchListStore.watchList.filter((list) => list.animeId !== id);
}
</script>

<style scoped lang="scss">
.grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2em;
}
.flex {
    display: flex;
}

.block {
    display: block;
}
</style>
