<template>
<div>
<transition name="fade" mode="out-in">
	<div v-if="user && narrow === false" class="ftskorzw wide">
		<MkRemoteCaution v-if="user.host != null" :href="user.url"/>

		<div class="banner-container" :style="style">
			<div ref="banner" class="banner" :style="style"></div>
		</div>
		<div class="contents">
			<div class="side _forceContainerFull_">
				<MkAvatar class="avatar" :user="user" :disable-preview="true" :show-indicator="true"/>
				<div class="name">
					<MkUserName :user="user" :nowrap="false" class="name"/>
					<MkAcct :user="user" :detail="true" class="acct"/>
				</div>
				<div v-if="$i && $i.id != user.id && user.isFollowed" class="followed"><span>{{ $ts.followsYou }}</span></div>
				<div class="status">
					<MkA :to="userPage(user)" :class="{ active: page === 'index' }">
						<b>{{ number(user.notesCount) }}</b>
						<span>{{ $ts.notes }}</span>
					</MkA>
					<MkA :to="userPage(user, 'following')" :class="{ active: page === 'following' }">
						<b>{{ number(user.followingCount) }}</b>
						<span>{{ $ts.following }}</span>
					</MkA>
					<MkA :to="userPage(user, 'followers')" :class="{ active: page === 'followers' }">
						<b>{{ number(user.followersCount) }}</b>
						<span>{{ $ts.followers }}</span>
					</MkA>
				</div>
				<div class="description">
					<Mfm v-if="user.description" :text="user.description" :is-note="false" :author="user" :i="$i" :custom-emojis="user.emojis"/>
					<p v-else class="empty">{{ $ts.noAccountDescription }}</p>
				</div>
				<div class="fields system">
					<dl v-if="user.location" class="field">
						<dt class="name"><i class="fas fa-map-marker fa-fw"></i> {{ $ts.location }}</dt>
						<dd class="value">{{ user.location }}</dd>
					</dl>
					<dl v-if="user.birthday" class="field">
						<dt class="name"><i class="fas fa-birthday-cake fa-fw"></i> {{ $ts.birthday }}</dt>
						<dd class="value">{{ user.birthday.replace('-', '/').replace('-', '/') }} ({{ $t('yearsOld', { age }) }})</dd>
					</dl>
					<dl class="field">
						<dt class="name"><i class="fas fa-calendar-alt fa-fw"></i> {{ $ts.registeredDate }}</dt>
						<dd class="value">{{ new Date(user.createdAt).toLocaleString() }} (<MkTime :time="user.createdAt"/>)</dd>
					</dl>
				</div>
				<div v-if="user.fields.length > 0" class="fields">
					<dl v-for="(field, i) in user.fields" :key="i" class="field">
						<dt class="name">
							<Mfm :text="field.name" :plain="true" :custom-emojis="user.emojis" :colored="false"/>
						</dt>
						<dd class="value">
							<Mfm :text="field.value" :author="user" :i="$i" :custom-emojis="user.emojis" :colored="false"/>
						</dd>
					</dl>
				</div>
				<XActivity :key="user.id" :user="user" class="_gap"/>
				<XPhotos :key="user.id" :user="user" class="_gap"/>
			</div>
			<div class="main">
				<div class="actions">
					<button class="menu _button" @click="menu"><i class="fas fa-ellipsis-h"></i></button>
					<MkFollowButton v-if="!$i || $i.id != user.id" :user="user" :inline="true" :transparent="false" :full="true" large class="koudoku"/>
				</div>
				<template v-if="page === 'index'">
					<div v-if="user.pinnedNotes.length > 0" class="_gap">
						<XNote v-for="note in user.pinnedNotes" :key="note.id" class="note _gap" :note="note" :pinned="true" @update:note="pinnedNoteUpdated(note, $event)"/>
					</div>
					<div class="_gap">
						<XUserTimeline :user="user"/>
					</div>
				</template>
				<XFollowList v-else-if="page === 'following'" type="following" :user="user" class="_gap"/>
				<XFollowList v-else-if="page === 'followers'" type="followers" :user="user" class="_gap"/>
				<XClips v-else-if="page === 'clips'" :user="user" class="_gap"/>
				<XPages v-else-if="page === 'pages'" :user="user" class="_gap"/>
			</div>
		</div>
	</div>
	<MkSpacer v-else-if="user && narrow === true" :content-max="800">
		<div v-size="{ max: [500] }" class="ftskorzw narrow">
			<!-- TODO -->
			<!-- <div class="punished" v-if="user.isSuspended"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> {{ $ts.userSuspended }}</div> -->
			<!-- <div class="punished" v-if="user.isSilenced"><i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i> {{ $ts.userSilenced }}</div> -->

			<div class="profile">
				<MkRemoteCaution v-if="user.host != null" :href="user.url" class="warn"/>

				<div :key="user.id" class="_block main">
					<div class="banner-container" :style="style">
						<div ref="banner" class="banner" :style="style"></div>
						<div class="fade"></div>
						<div class="title">
							<MkUserName class="name" :user="user" :nowrap="true"/>
							<div class="bottom">
								<span class="username"><MkAcct :user="user" :detail="true" /></span>
								<span v-if="user.isAdmin" :title="$ts.isAdmin" style="color: var(--badge);"><i class="fas fa-bookmark"></i></span>
								<span v-if="!user.isAdmin && user.isModerator" :title="$ts.isModerator" style="color: var(--badge);"><i class="far fa-bookmark"></i></span>
								<span v-if="user.isLocked" :title="$ts.isLocked"><i class="fas fa-lock"></i></span>
								<span v-if="user.isBot" :title="$ts.isBot"><i class="fas fa-robot"></i></span>
							</div>
						</div>
						<span v-if="$i && $i.id != user.id && user.isFollowed" class="followed">{{ $ts.followsYou }}</span>
						<div v-if="$i" class="actions">
							<button class="menu _button" @click="menu"><i class="fas fa-ellipsis-h"></i></button>
							<MkFollowButton v-if="$i.id != user.id" :user="user" :inline="true" :transparent="false" :full="true" class="koudoku"/>
						</div>
					</div>
					<MkAvatar class="avatar" :user="user" :disable-preview="true" :show-indicator="true"/>
					<div class="title">
						<MkUserName :user="user" :nowrap="false" class="name"/>
						<div class="bottom">
							<span class="username"><MkAcct :user="user" :detail="true" /></span>
							<span v-if="user.isAdmin" :title="$ts.isAdmin" style="color: var(--badge);"><i class="fas fa-bookmark"></i></span>
							<span v-if="!user.isAdmin && user.isModerator" :title="$ts.isModerator" style="color: var(--badge);"><i class="far fa-bookmark"></i></span>
							<span v-if="user.isLocked" :title="$ts.isLocked"><i class="fas fa-lock"></i></span>
							<span v-if="user.isBot" :title="$ts.isBot"><i class="fas fa-robot"></i></span>
						</div>
					</div>
					<div class="description">
						<Mfm v-if="user.description" :text="user.description" :is-note="false" :author="user" :i="$i" :custom-emojis="user.emojis"/>
						<p v-else class="empty">{{ $ts.noAccountDescription }}</p>
					</div>
					<div class="fields system">
						<dl v-if="user.location" class="field">
							<dt class="name"><i class="fas fa-map-marker fa-fw"></i> {{ $ts.location }}</dt>
							<dd class="value">{{ user.location }}</dd>
						</dl>
						<dl v-if="user.birthday" class="field">
							<dt class="name"><i class="fas fa-birthday-cake fa-fw"></i> {{ $ts.birthday }}</dt>
							<dd class="value">{{ user.birthday.replace('-', '/').replace('-', '/') }} ({{ $t('yearsOld', { age }) }})</dd>
						</dl>
						<dl class="field">
							<dt class="name"><i class="fas fa-calendar-alt fa-fw"></i> {{ $ts.registeredDate }}</dt>
							<dd class="value">{{ new Date(user.createdAt).toLocaleString() }} (<MkTime :time="user.createdAt"/>)</dd>
						</dl>
					</div>
					<div v-if="user.fields.length > 0" class="fields">
						<dl v-for="(field, i) in user.fields" :key="i" class="field">
							<dt class="name">
								<Mfm :text="field.name" :plain="true" :custom-emojis="user.emojis" :colored="false"/>
							</dt>
							<dd class="value">
								<Mfm :text="field.value" :author="user" :i="$i" :custom-emojis="user.emojis" :colored="false"/>
							</dd>
						</dl>
					</div>
					<div class="status">
						<MkA v-click-anime :to="userPage(user)" :class="{ active: page === 'index' }">
							<b>{{ number(user.notesCount) }}</b>
							<span>{{ $ts.notes }}</span>
						</MkA>
						<MkA v-click-anime :to="userPage(user, 'following')" :class="{ active: page === 'following' }">
							<b>{{ number(user.followingCount) }}</b>
							<span>{{ $ts.following }}</span>
						</MkA>
						<MkA v-click-anime :to="userPage(user, 'followers')" :class="{ active: page === 'followers' }">
							<b>{{ number(user.followersCount) }}</b>
							<span>{{ $ts.followers }}</span>
						</MkA>
					</div>
				</div>
			</div>

			<div class="contents">
				<template v-if="page === 'index'">
					<div>
						<div v-if="user.pinnedNotes.length > 0" class="_gap">
							<XNote v-for="note in user.pinnedNotes" :key="note.id" class="note _block" :note="note" :pinned="true" @update:note="pinnedNoteUpdated(note, $event)"/>
						</div>
						<MkInfo v-else-if="$i && $i.id === user.id">{{ $ts.userPagePinTip }}</MkInfo>
						<XPhotos :key="user.id" :user="user"/>
						<XActivity :key="user.id" :user="user" style="margin-top: var(--margin);"/>
					</div>
					<div>
						<XUserTimeline :user="user"/>
					</div>
				</template>
				<XFollowList v-else-if="page === 'following'" type="following" :user="user" class="_content _gap"/>
				<XFollowList v-else-if="page === 'followers'" type="followers" :user="user" class="_content _gap"/>
				<XReactions v-else-if="page === 'reactions'" :user="user" class="_gap"/>
				<XClips v-else-if="page === 'clips'" :user="user" class="_gap"/>
				<XPages v-else-if="page === 'pages'" :user="user" class="_gap"/>
				<XGallery v-else-if="page === 'gallery'" :user="user" class="_gap"/>
			</div>
		</div>
	</MkSpacer>
	<MkError v-else-if="error" @retry="fetch()"/>
	<MkLoading v-else/>
</transition>
</div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, computed } from 'vue';
import * as age from 's-age';
import XUserTimeline from './index.timeline.vue';
import XNote from '@/components/note.vue';
import MkFollowButton from '@/components/follow-button.vue';
import MkContainer from '@/components/ui/container.vue';
import MkFolder from '@/components/ui/folder.vue';
import MkRemoteCaution from '@/components/remote-caution.vue';
import MkTab from '@/components/tab.vue';
import MkInfo from '@/components/ui/info.vue';
import Progress from '@/scripts/loading';
import * as Acct from 'misskey-js/built/acct';
import { getScrollPosition } from '@/scripts/scroll';
import { getUserMenu } from '@/scripts/get-user-menu';
import number from '@/filters/number';
import { userPage, acct as getAcct } from '@/filters/user';
import * as os from '@/os';
import * as symbols from '@/symbols';

export default defineComponent({
	components: {
		XUserTimeline,
		XNote,
		MkFollowButton,
		MkContainer,
		MkRemoteCaution,
		MkFolder,
		MkTab,
		MkInfo,
		XFollowList: defineAsyncComponent(() => import('./follow-list.vue')),
		XReactions: defineAsyncComponent(() => import('./reactions.vue')),
		XClips: defineAsyncComponent(() => import('./clips.vue')),
		XPages: defineAsyncComponent(() => import('./pages.vue')),
		XGallery: defineAsyncComponent(() => import('./gallery.vue')),
		XPhotos: defineAsyncComponent(() => import('./index.photos.vue')),
		XActivity: defineAsyncComponent(() => import('./index.activity.vue')),
	},

	props: {
		acct: {
			type: String,
			required: true
		},
		page: {
			type: String,
			required: false,
			default: 'index'
		}
	},

	data() {
		return {
			[symbols.PAGE_INFO]: computed(() => this.user ? {
				icon: 'fas fa-user',
				title: this.user.name ? `${this.user.name} (@${this.user.username})` : `@${this.user.username}`,
				subtitle: `@${getAcct(this.user)}`,
				userName: this.user,
				avatar: this.user,
				path: `/@${this.user.username}`,
				share: {
					title: this.user.name,
				},
				bg: 'var(--bg)',
				tabs: [{
					active: this.page === 'index',
					title: this.$ts.overview,
					icon: 'fas fa-home',
					onClick: () => { this.$router.push('/@' + getAcct(this.user)); },
				}, ...(this.$i && (this.$i.id === this.user.id)) || this.user.publicReactions ? [{
					active: this.page === 'reactions',
					title: this.$ts.reaction,
					icon: 'fas fa-laugh',
					onClick: () => { this.$router.push('/@' + getAcct(this.user) + '/reactions'); },
				}] : [], {
					active: this.page === 'clips',
					title: this.$ts.clips,
					icon: 'fas fa-paperclip',
					onClick: () => { this.$router.push('/@' + getAcct(this.user) + '/clips'); },
				}, {
					active: this.page === 'pages',
					title: this.$ts.pages,
					icon: 'fas fa-file-alt',
					onClick: () => { this.$router.push('/@' + getAcct(this.user) + '/pages'); },
				}, {
					active: this.page === 'gallery',
					title: this.$ts.gallery,
					icon: 'fas fa-icons',
					onClick: () => { this.$router.push('/@' + getAcct(this.user) + '/gallery'); },
				}],
			} : null),
			user: null,
			error: null,
			parallaxAnimationId: null,
			narrow: null,
		};
	},

	computed: {
		style(): any {
			if (this.user.bannerUrl == null) return {};
			return {
				backgroundImage: `url(${ this.user.bannerUrl })`
			};
		},

		age(): number {
			return age(this.user.birthday);
		}
	},

	watch: {
		acct: 'fetch'
	},

	created() {
		this.fetch();
	},

	mounted() {
		window.requestAnimationFrame(this.parallaxLoop);
		this.narrow = true//this.$el.clientWidth < 1000;
	},

	beforeUnmount() {
		window.cancelAnimationFrame(this.parallaxAnimationId);
	},

	methods: {
		getAcct,

		fetch() {
			if (this.acct == null) return;
			this.user = null;
			Progress.start();
			os.api('users/show', Acct.parse(this.acct)).then(user => {
				this.user = user;
			}).catch(e => {
				this.error = e;
			}).finally(() => {
				Progress.done();
			});
		},

		menu(ev) {
			os.popupMenu(getUserMenu(this.user), ev.currentTarget || ev.target);
		},

		parallaxLoop() {
			this.parallaxAnimationId = window.requestAnimationFrame(this.parallaxLoop);
			this.parallax();
		},

		parallax() {
			const banner = this.$refs.banner as any;
			if (banner == null) return;

			const top = getScrollPosition(this.$el);

			if (top < 0) return;

			const z = 1.75; // 奥行き(小さいほど奥)
			const pos = -(top / z);
			banner.style.backgroundPosition = `center calc(50% - ${pos}px)`;
		},

		pinnedNoteUpdated(oldValue, newValue) {
			const i = this.user.pinnedNotes.findIndex(n => n === oldValue);
			this.user.pinnedNotes[i] = newValue;
		},

		number,

		userPage
	}
});
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.125s ease;
}
.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.ftskorzw.wide {

	> .banner-container {
		position: relative;
		height: 300px;
		overflow: hidden;
		background-size: cover;
		background-position: center;

		> .banner {
			height: 100%;
			background-color: #4c5e6d;
			background-size: cover;
			background-position: center;
			box-shadow: 0 0 128px rgba(0, 0, 0, 0.5) inset;
			will-change: background-position;
		}
	}

	> .contents {
		display: flex;
		padding: 16px;

		> .side {
			width: 360px;

			> .avatar {
				display: block;
				width: 180px;
				height: 180px;
				margin: -130px auto 0 auto;
			}

			> .name {
				padding: 16px 0px 20px 0;
				text-align: center;

				> .name {
					display: block;
					font-size: 1.75em;
					font-weight: bold;
				}
			}

			> .followed {
				text-align: center;

				> span {
					display: inline-block;
					font-size: 80%;
					padding: 8px 12px;
					margin-bottom: 20px;
					border: solid 0.5px var(--divider);
					border-radius: 999px;
				}
			}

			> .status {
				display: flex;
				padding: 20px 16px;
				border-top: solid 0.5px var(--divider);
				font-size: 90%;

				> a {
					flex: 1;
					text-align: center;

					&.active {
						color: var(--accent);
					}

					&:hover {
						text-decoration: none;
					}

					> b {
						display: block;
						line-height: 16px;
					}

					> span {
						font-size: 75%;
					}
				}
			}

			> .description {
				padding: 20px 16px;
				border-top: solid 0.5px var(--divider);
				font-size: 90%;
			}

			> .fields {
				padding: 20px 16px;
				border-top: solid 0.5px var(--divider);
				font-size: 90%;

				> .field {
					display: flex;
					padding: 0;
					margin: 0;
					align-items: center;

					&:not(:last-child) {
						margin-bottom: 8px;
					}

					> .name {
						width: 30%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						font-weight: bold;
					}

					> .value {
						width: 70%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						margin: 0;
					}
				}
			}
		}

		> .main {
			flex: 1;
			margin-left: var(--margin);
			min-width: 0;

			> .nav {
				display: flex;
				align-items: center;
				margin-top: var(--margin);
				//font-size: 120%;
				font-weight: bold;

				> .link {
					display: inline-block;
					padding: 15px 24px 12px 24px;
					text-align: center;
					border-bottom: solid 3px transparent;

					&:hover {
						text-decoration: none;
					}

					&.active {
						color: var(--accent);
						border-bottom-color: var(--accent);
					}

					&:not(.active):hover {
						color: var(--fgHighlighted);
					}

					> .icon {
						margin-right: 6px;
					}
				}

				> .actions {
					display: flex;
					align-items: center;
					margin-left: auto;

					> .menu {
						padding: 12px 16px;
					}
				}
			}
		}
	}
}

.ftskorzw.narrow {
	box-sizing: border-box;
	overflow: clip;
	background: var(--bg);

	> .punished {
		font-size: 0.8em;
		padding: 16px;
	}

	> .profile {

		> .main {
			position: relative;
			overflow: hidden;

			> .banner-container {
				position: relative;
				height: 250px;
				overflow: hidden;
				background-size: cover;
				background-position: center;

				> .banner {
					height: 100%;
					background-color: #4c5e6d;
					background-size: cover;
					background-position: center;
					box-shadow: 0 0 128px rgba(0, 0, 0, 0.5) inset;
					will-change: background-position;
				}

				> .fade {
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					height: 78px;
					background: linear-gradient(transparent, rgba(#000, 0.7));
				}

				> .followed {
					position: absolute;
					top: 12px;
					left: 12px;
					padding: 4px 8px;
					color: #fff;
					background: rgba(0, 0, 0, 0.7);
					font-size: 0.7em;
					border-radius: 6px;
				}

				> .actions {
					position: absolute;
					top: 12px;
					right: 12px;
					-webkit-backdrop-filter: var(--blur, blur(8px));
					backdrop-filter: var(--blur, blur(8px));
					background: rgba(0, 0, 0, 0.2);
					padding: 8px;
					border-radius: 24px;

					> .menu {
						vertical-align: bottom;
						height: 31px;
						width: 31px;
						color: #fff;
						text-shadow: 0 0 8px #000;
						font-size: 16px;
					}

					> .koudoku {
						margin-left: 4px;
						vertical-align: bottom;
					}
				}

				> .title {
					position: absolute;
					bottom: 0;
					left: 0;
					width: 100%;
					padding: 0 0 8px 154px;
					box-sizing: border-box;
					color: #fff;

					> .name {
						display: block;
						margin: 0;
						line-height: 32px;
						font-weight: bold;
						font-size: 1.8em;
						text-shadow: 0 0 8px #000;
					}

					> .bottom {
						> * {
							display: inline-block;
							margin-right: 16px;
							line-height: 20px;
							opacity: 0.8;

							&.username {
								font-weight: bold;
							}
						}
					}
				}
			}

			> .title {
				display: none;
				text-align: center;
				padding: 50px 8px 16px 8px;
				font-weight: bold;
				border-bottom: solid 0.5px var(--divider);

				> .bottom {
					> * {
						display: inline-block;
						margin-right: 8px;
						opacity: 0.8;
					}
				}
			}

			> .avatar {
				display: block;
				position: absolute;
				top: 170px;
				left: 16px;
				z-index: 2;
				width: 120px;
				height: 120px;
				box-shadow: 1px 1px 3px rgba(#000, 0.2);
			}

			> .description {
				padding: 24px 24px 24px 154px;
				font-size: 0.95em;

				> .empty {
					margin: 0;
					opacity: 0.5;
				}
			}

			> .fields {
				padding: 24px;
				font-size: 0.9em;
				border-top: solid 0.5px var(--divider);

				> .field {
					display: flex;
					padding: 0;
					margin: 0;
					align-items: center;

					&:not(:last-child) {
						margin-bottom: 8px;
					}

					> .name {
						width: 30%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						font-weight: bold;
						text-align: center;
					}

					> .value {
						width: 70%;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
						margin: 0;
					}
				}

				&.system > .field > .name {
				}
			}

			> .status {
				display: flex;
				padding: 24px;
				border-top: solid 0.5px var(--divider);

				> a {
					flex: 1;
					text-align: center;

					&.active {
						color: var(--accent);
					}

					&:hover {
						text-decoration: none;
					}

					> b {
						display: block;
						line-height: 16px;
					}

					> span {
						font-size: 70%;
					}
				}
			}
		}
	}

	> .contents {
		> .content {
			margin-bottom: var(--margin);
		}
	}

	&.max-width_500px {
		> .profile > .main {
			> .banner-container {
				height: 140px;

				> .fade {
					display: none;
				}

				> .title {
					display: none;
				}
			}

			> .title {
				display: block;
			}

			> .avatar {
				top: 90px;
				left: 0;
				right: 0;
				width: 92px;
				height: 92px;
				margin: auto;
			}

			> .description {
				padding: 16px;
				text-align: center;
			}

			> .fields {
				padding: 16px;
			}

			> .status {
				padding: 16px;
			}
		}

		> .contents {
			> .nav {
				font-size: 80%;
			}
		}
	}
}
</style>
