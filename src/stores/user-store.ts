import { defineStore } from 'pinia';
import { Cookies } from 'quasar';
import { User } from 'src/components/models';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {} as User,
    }),
    getters: {
        isAuth(): boolean {
            return this.user.id !== undefined;
        },
    },
    actions: {
        signOut(cookies: Cookies) {
            cookies.remove('token');
            cookies.remove('refreshToken');
            this.$reset();
        },
        async saveSettings() {
            const {
                notifyDiscord,
                notifyPush,
                notifyTelegram,
                notifyVK,
                shikimoriExportList,
                showCensoredContent,
                siteTheme,
                watchListMode,
                watchListAddAfterEpisodes,
                watchListAskAboutRating,
                watchListAutoAdd,
                watchListIgnoreOptionForLessEpisodes,
                watchListWatchedPercentage,
                watchListUnsubAfterDrop,
            } = this.user.settings;

            this.api.patch('users/settings', {
                notifyDiscord,
                notifyPush,
                notifyTelegram,
                notifyVK,
                shikimoriExportList,
                showCensoredContent,
                siteTheme,
                watchListMode,
                watchListAddAfterEpisodes,
                watchListAskAboutRating,
                watchListAutoAdd,
                watchListIgnoreOptionForLessEpisodes,
                watchListWatchedPercentage,
                watchListUnsubAfterDrop,
            });
        }
    },
});
