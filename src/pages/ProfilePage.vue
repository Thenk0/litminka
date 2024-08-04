<template>
    <q-page padding>
        <div>
            <div>{{ store.user.login }}</div>
            <div>{{ store.user.email }}</div>
            <div>{{ store.user.id }}</div>
        </div>
        <div>
            <h4>Настройки</h4>

            <q-radio v-model="store.user.settings.watchListMode" val="manual" label="Ручной" />
            <q-radio
                v-model="store.user.settings.watchListMode"
                val="auto"
                label="Автоматический" />

            <div v-if="store.user.settings.watchListMode === watchListMode.Auto">
                <q-checkbox
                    v-model="store.user.settings.watchListAskAboutRating"
                    label="Запрашивать оценку тайтла после его просмотра"
                    color="teal" />
                <div>
                    <q-checkbox
                        v-model="store.user.settings.watchListAutoAdd"
                        label="Автоматическое добавления тайтла в список"
                        color="teal" />
                </div>
                <div v-if="store.user.settings.watchListAutoAdd">
                    <q-input
                        v-model="store.user.settings.watchListAddAfterEpisodes"
                        label="Через сколько серий тайтл добавляется в список" />
                    <q-checkbox
                        v-model="store.user.settings.watchListIgnoreOptionForLessEpisodes"
                        label="Игнорировать опцию для тайтлов с меньшим кол-вом серий"
                        color="teal" />
                </div>
                <q-input
                    type="number"
                    v-model="store.user.settings.watchListWatchedPercentage"
                    label="Через какой процент времени, серия считается просмотренной" />
                <span>
                    При длине серии в 24 минуты она будет считаться просмотренной после
                    {{ minutesExample }} минут.
                </span>
                <div>
                    <q-checkbox
                        v-model="store.user.settings.watchListUnsubAfterDrop"
                        label="Отписываться от озвучек при дропе тайтла"
                        color="teal" />
                </div>
                <q-btn @click="saveSettings">Сохранить настройки</q-btn>
            </div>
        </div>
    </q-page>
</template>

<script setup lang="ts">
import { WatchListMode } from 'src/components/models';
import { useUserStore } from 'src/stores/user-store';
import { computed, ref } from 'vue';

defineOptions({
    name: 'ProfilePage',
});

const watchListMode = ref(WatchListMode);

const store = useUserStore();

const minutesExample = computed(() => {
    const seconds = 24 * 60; // 24 минуты
    const percent = (seconds * store.user.settings.watchListWatchedPercentage) / 100;
    return percent / 60;
});

async function saveSettings() {
    await store.saveSettings();
}
</script>
