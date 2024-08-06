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
                    label="Запрашивать оценку аниме после его просмотра"
                    color="teal" />
                <div>
                    <q-checkbox
                        v-model="store.user.settings.watchListAutoAdd"
                        label="Автоматическое добавления аниме в 'Смотрю'"
                        color="teal" />
                </div>
                <div v-if="store.user.settings.watchListAutoAdd">
                    <q-input
                        v-model="store.user.settings.watchListAddAfterEpisodes"
                        label="Через сколько серий аниме добавляется в список" />
                    <q-checkbox
                        v-model="store.user.settings.watchListIgnoreOptionForLessEpisodes"
                        label="Игнорировать опцию для аниме с меньшим кол-вом серий"
                        color="teal" />
                </div>
                <div>Через какой процент времени, серия считается просмотренной</div>
                <q-slider
                    style="width: 25%"
                    type="number"
                    :marker-labels="labels"
                    :step="5"
                    v-model="store.user.settings.watchListWatchedPercentage" />
                <div>
                    При длине серии в 24 минуты она будет считаться просмотренной после
                    {{ minutesExample }} минут.
                </div>
                <div>
                    <q-checkbox
                        v-model="store.user.settings.watchListUnsubAfterDrop"
                        label="Отписываться от озвучек при дропе аниме"
                        color="teal" />
                </div>
            </div>
            <q-btn @click="saveSettings">Сохранить настройки</q-btn>
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

const labels = [
    { value: 0, label: '0%' },
    { value: 10, label: '10%' },
    { value: 20, label: '20%' },
    { value: 30, label: '30%' },
    { value: 40, label: '40%' },
    { value: 50, label: '50%' },
    { value: 60, label: '60%' },
    { value: 70, label: '70%' },
    { value: 80, label: '80%' },
    { value: 90, label: '90%' },
    { value: 100, label: '100%' },
];

async function saveSettings() {
    await store.saveSettings();
}
</script>
