import { AxiosRequestConfig } from 'axios';
import { defineStore } from 'pinia';
import { AnimeListStatuses, WatchListWithAnime } from 'src/components/models';

export const useWatchListStore = defineStore('watchList', {
    state: () => ({
        watchList: [] as WatchListWithAnime[],
        listCount: 0,
    }),

    getters: {},

    actions: {
        async getWatchList(statuses?: AnimeListStatuses[]) {
            const params: AxiosRequestConfig['params'] = {
                pageLimit: 25,
            }
            if (typeof statuses !== 'undefined') {
                params.statuses = statuses
            }
            const response = await this.api.get('watch-list', {
                params
            });
            this.watchList = response.data.body.list;
            this.listCount = response.data.body.count;
        },
        async appendWatchList(page: number, statuses?: AnimeListStatuses[]) {
            const params: AxiosRequestConfig['params'] = {
                page,
                pageLimit: 25
            }

            if (typeof statuses !== 'undefined') {
                params.statuses = statuses
            }

            const response = await this.api.get('watch-list', {
                params
            });
            this.watchList.push(...response.data.body.list);
            this.listCount = response.data.body.count;
        }
    },
});
