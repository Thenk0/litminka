<template>
    <q-page v-if="animeStore.anime.id" class="container" padding>
        <div class="row">
            <div class="col-3">
                <q-img :src="animeStore.anime.image">
                    <div v-if="listEntry" class="absolute-top-right text-subtitle2">
                        <q-btn
                            @click="toggleFavorite"
                            flat
                            :class="{ favorite: listEntry.isFavorite }">
                            <q-icon v-if="listEntry.isFavorite" name="favorite" />
                            <q-icon v-else name="favorite_border" />
                        </q-btn>
                    </div>
                </q-img>
                <div class="row">
                    <q-rating
                        :model-value="animeStore.anime.shikimoriRating"
                        @update:model-value="updateRating"
                        :readonly="typeof listEntry === 'undefined'"
                        size="sm"
                        :max="10"
                        color="primary"
                        icon="star_border"
                        icon-selected="star"
                        icon-half="star_half" />
                    <span>
                        {{ animeStore.anime.shikimoriRating }}
                        <span v-if="listEntry?.rating">({{ listEntry.rating }})</span>
                    </span>
                </div>
                <div v-if="userStore.isAuth">
                    <div>Список</div>
                    <q-select
                        filled
                        v-model="listEntry.status"
                        emit-value
                        map-options
                        :options="watchListStatuses"
                        label="Статус"
                        style="width: 250px">
                        <template v-slot:option="{ itemProps, opt }">
                            <q-item v-bind="itemProps">
                                <q-item-section>
                                    <q-item-label>{{ opt.label }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </template>
                    </q-select>
                    <q-input
                        :min="0"
                        :max="animeStore.anime.currentEpisodes"
                        v-model="listEntry.watchedEpisodes"
                        type="number" />
                    <div
                        v-if="
                            userStore.user.settings.watchListMode === 'auto' &&
                            listEntry.status !== 'dropped' &&
                            listEntry.id !== 0
                        ">
                        <q-btn
                            style="background: #ff0080; color: white; width: 100%"
                            @click="dropTitle">
                            Дропнуть тайтл
                        </q-btn>
                    </div>
                    <q-btn @click="saveList">Сохранить</q-btn>
                </div>
            </div>
            <div class="col-9 q-pa-sm">
                <div class="text-h2">{{ animeStore.anime.name }}</div>
                <q-separator class="q-my-md" inset />
                <div class="col-12">
                    <div class="row">
                        <div class="col-3">Альтернативные названия</div>
                        <div class="col-9">
                            {{ animeStore.anime.englishName }},
                            {{ animeStore.anime.japaneseName }}
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3">Жанры</div>
                        <div class="col-9">
                            <q-badge
                                v-for="genre in animeStore.anime.genres"
                                :key="genre.id"
                                color="blue">
                                <router-link
                                    :to="{
                                        path: '/anime/search',
                                        query: { includeGenres: genre.id },
                                    }">
                                    {{ genre.nameRussian }}
                                </router-link>
                            </q-badge>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3">Тип</div>
                        <div class="row">{{ animeStore.anime.mediaType }}</div>
                    </div>
                    <div class="row">
                        <div class="col-3">Количество серий</div>
                        <div class="col-9">
                            <div class="row">
                                {{ animeStore.anime.currentEpisodes }}/{{
                                    animeStore.anime.maxEpisodes === 0
                                        ? '?'
                                        : animeStore.anime.maxEpisodes
                                }}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3">Состояние</div>
                        <div class="col-9">
                            {{ animeStore.anime.status }}
                        </div>
                    </div>
                    <q-separator class="q-my-md" inset />
                    <div class="row">
                        <div>
                            <div class="text-h5">Описание</div>
                            {{ escapeText(animeStore.anime.description) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <kodik-player
            @follow="follow"
            @unfollow="unfollow"
            @episode-watched="episodeWatched"
            v-if="animeStore.anime.animeTranslations.length > 0"
            :anime="animeStore.anime"></kodik-player>
        <div v-else>Пока нет возможности смотреть</div>
    </q-page>
    <div v-else>Loading</div>
</template>

<script setup lang="ts">
import { defineOptions, ref } from 'vue';
import { useAnimeStore } from 'src/stores/anime-store';
import KodikPlayer from 'src/components/kodik/KodikPlayer.vue';
import { useUserStore } from 'src/stores/user-store';
import { useI18n } from 'vue-i18n';
import {
    AnimeListStatuses,
    AnimeStatuses,
    AnimeTranslation,
    FollowTypes,
    WatchList,
    WatchListMode,
} from 'src/components/models';
import { useQuasar } from 'quasar';

const { t } = useI18n();
const $q = useQuasar();

defineOptions({
    name: 'AnimeSingle',
    async preFetch({ store, currentRoute }) {
        const animeStore = useAnimeStore(store);

        const response = await animeStore.api.get(`/anime/${currentRoute.params.slug}`);

        animeStore.anime = response.data.body;
    },
});

function escapeText(text: string) {
    if (!text) return '';
    text = text.replace(/\s+/g, ' ').trim();
    return text.replaceAll(/\[.+\]/g, '');
}

const animeStore = useAnimeStore();
const userStore = useUserStore();

const watchListStatuses = ref(
    Object.freeze(
        Object.keys(AnimeListStatuses).map((rating) => {
            return {
                value: rating.toLowerCase(),
                label: t(`animeListStatuses.${rating}`),
            };
        }),
    ),
);

let listEntry = ref<WatchList>({
    watchedEpisodes: 0,
    isFavorite: false,
    rating: 0,
    status: AnimeListStatuses.on_hold,
    animeId: animeStore.anime.id,
    userId: userStore.user.id ?? 0,
    shikimoriId: 0,
    id: 0,
});

if (animeStore.anime.animeLists && animeStore.anime.animeLists.length > 0) {
    listEntry.value = animeStore.anime.animeLists[0];
}

async function saveList() {
    const body = {
        watchedEpisodes: listEntry.value?.watchedEpisodes ?? 0,
        status: listEntry.value?.status ?? '',
        rating: 0,
        isFavorite: false,
    };

    if (listEntry.value.id !== 0) {
        userStore.api.patch(`/watch-list/${animeStore.anime.id}`, body);
        return;
    }

    const response = await userStore.api.post(`/watch-list/${animeStore.anime.id}`, body);

    listEntry.value = response.data.body as WatchList;
    $q.notify({
        color: 'info',
        position: 'bottom-right',
        message: 'Аниме добавлено в список',
        timeout: 1500,
    });
}

async function dropTitle() {
    listEntry.value.status = AnimeListStatuses.dropped;
    await saveList();
    if (!userStore.user.settings.watchListUnsubAfterDrop) return;
    await unfollow();
}

async function updateRating(value: number) {
    if (!listEntry.value) return;

    const body = {
        watchedEpisodes: listEntry.value.watchedEpisodes,
        status: listEntry.value.status,
        rating: value,
        isFavorite: listEntry.value.isFavorite,
    };

    const response = await userStore.api.patch(`/watch-list/${animeStore.anime.id}`, body);
    listEntry.value = response.data.body as WatchList;
    $q.notify({
        color: 'info',
        position: 'bottom-right',
        message: `Вы оценили аниме на: ${value}`,
        timeout: 1500,
    });
}

async function toggleFavorite() {
    if (!listEntry.value) return;

    const body = {
        watchedEpisodes: listEntry.value.watchedEpisodes,
        status: listEntry.value.status,
        rating: listEntry.value.rating,
        isFavorite: !listEntry.value.isFavorite,
    };

    const response = await userStore.api.patch(`/watch-list/${animeStore.anime.id}`, body);
    listEntry.value = response.data.body as WatchList;
    $q.notify({
        color: 'info',
        position: 'bottom-right',
        message: 'Фаворит изменен',
        timeout: 1500,
    });
}

async function follow(translation?: AnimeTranslation) {
    if (animeStore.anime.status === AnimeStatuses.Released) {
        // TODO: Throw Error here
        return;
    }

    const followType: FollowTypes =
        animeStore.anime.status === AnimeStatuses.Ongoing
            ? FollowTypes.Follow
            : FollowTypes.Announcement;

    await userStore.api.post(`/anime/follow/${animeStore.anime.id}`, {
        type: followType,
        groupName: translation?.group.name,
    });

    $q.notify({
        color: 'info',
        position: 'bottom-right',
        message: 'Подписка на аниме успешно оформлена',
        timeout: 1500,
    });

    if (animeStore.anime.status === AnimeStatuses.Announced) return;

    animeStore.anime.follows?.push({
        id: 0, // zero means we emulate the response
        status: FollowTypes.Follow,
        animeId: animeStore.anime.id,
        translationId: translation!.id,
        translation: translation!,
        userId: userStore.user.id,
    });
}

async function unfollow(translation?: AnimeTranslation) {
    await userStore.api.delete(`/anime/follow/${animeStore.anime.id}`, {
        data: {
            groupName: translation?.group.name ?? undefined,
        },
    });
    if (animeStore.anime.status === AnimeStatuses.Announced || typeof translation === 'undefined') {
        animeStore.anime.follows = [];
        return;
    }

    const animeTranslation = animeStore.anime.follows?.find(
        (anime) => anime.translation.groupId === translation!.groupId,
    );

    if (typeof animeTranslation === 'undefined') return;
    const index = animeStore.anime.follows?.indexOf(animeTranslation);
    if (typeof index === 'undefined') return;
    animeStore.anime.follows?.splice(index, 1);

    $q.notify({
        color: 'info',
        position: 'bottom-right',
        message: 'Вы отписались от аниме',
        timeout: 1500,
    });
}

async function episodeWatched(episode: number) {
    episode = episode > 0 ? episode : 1;
    if (!userStore.isAuth || userStore.user.settings.watchListMode !== WatchListMode.Auto) return;

    const list = listEntry.value;
    const isInList: boolean = listEntry.value.id !== 0;

    const body = {
        watchedEpisodes: episode,
        status: '',
        rating: list.rating,
        isFavorite: list.isFavorite,
    };
    const userSettings = userStore.user.settings;
    if (!isInList && !userSettings.watchListAutoAdd) return;

    if (episode < userSettings.watchListAddAfterEpisodes) {
        if (animeStore.anime.maxEpisodes > userSettings.watchListAddAfterEpisodes) return;
        if (!userSettings.watchListIgnoreOptionForLessEpisodes) return;
    }

    body.status = AnimeListStatuses.watching;

    if (
        list.status === AnimeListStatuses.completed ||
        list.status === AnimeListStatuses.rewatching
    ) {
        body.status = AnimeListStatuses.rewatching;
    }

    if (episode >= animeStore.anime.maxEpisodes) {
        body.status = AnimeListStatuses.completed;
    }

    if (isInList) {
        const response = await userStore.api.patch(`/watch-list/${animeStore.anime.id}`, body);
        listEntry.value = response.data.body as WatchList;
        $q.notify({
            color: 'info',
            position: 'bottom-right',
            message: `Авто список: Аниме обновлено, Статус: ${body.status}, Серия ${body.watchedEpisodes}`,
        });
        return;
    }

    const response = await userStore.api.post(`/watch-list/${animeStore.anime.id}`, body);

    listEntry.value = response.data.body as WatchList;
    $q.notify({
        color: 'info',
        position: 'bottom-right',
        message: `Авто список: Аниме добавлено, Статус: ${body.status}, Серия ${body.watchedEpisodes}`,
    });
}
</script>

<style lang="scss">
.container {
    width: 70%;
    margin: 0 auto;
}

.favorite {
    color: red;
}
</style>
