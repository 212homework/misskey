<template>
<div class="rghtznwe"
	:class="{ draghover }"
	draggable="true"
	:title="title"
	@click="onClick"
	@contextmenu.stop="onContextmenu"
	@mouseover="onMouseover"
	@mouseout="onMouseout"
	@dragover.prevent.stop="onDragover"
	@dragenter.prevent="onDragenter"
	@dragleave="onDragleave"
	@drop.prevent.stop="onDrop"
	@dragstart="onDragstart"
	@dragend="onDragend"
>
	<p class="name">
		<template v-if="hover"><i class="fas fa-folder-open fa-fw"></i></template>
		<template v-if="!hover"><i class="fas fa-folder fa-fw"></i></template>
		{{ folder.name }}
	</p>
	<p v-if="$store.state.uploadFolder == folder.id" class="upload">
		{{ $ts.uploadFolder }}
	</p>
	<button v-if="selectMode" class="checkbox _button" :class="{ checked: isSelected }" @click.prevent.stop="checkboxClicked"></button>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import * as os from '@/os';

export default defineComponent({
	props: {
		folder: {
			type: Object,
			required: true,
		},
		isSelected: {
			type: Boolean,
			required: false,
			default: false,
		},
		selectMode: {
			type: Boolean,
			required: false,
			default: false,
		}
	},

	emits: ['chosen'],

	data() {
		return {
			hover: false,
			draghover: false,
			isDragging: false,
		};
	},

	computed: {
		browser(): any {
			return this.$parent;
		},
		title(): string {
			return this.folder.name;
		}
	},

	methods: {
		checkboxClicked(e) {
			this.$emit('chosen', this.folder);
		},

		onClick() {
			this.browser.move(this.folder);
		},

		onMouseover() {
			this.hover = true;
		},

		onMouseout() {
			this.hover = false
		},

		onDragover(e) {
			// 自分自身がドラッグされている場合
			if (this.isDragging) {
				// 自分自身にはドロップさせない
				e.dataTransfer.dropEffect = 'none';
				return;
			}

			const isFile = e.dataTransfer.items[0].kind == 'file';
			const isDriveFile = e.dataTransfer.types[0] == _DATA_TRANSFER_DRIVE_FILE_;
			const isDriveFolder = e.dataTransfer.types[0] == _DATA_TRANSFER_DRIVE_FOLDER_;

			if (isFile || isDriveFile || isDriveFolder) {
				e.dataTransfer.dropEffect = e.dataTransfer.effectAllowed == 'all' ? 'copy' : 'move';
			} else {
				e.dataTransfer.dropEffect = 'none';
			}
		},

		onDragenter() {
			if (!this.isDragging) this.draghover = true;
		},

		onDragleave() {
			this.draghover = false;
		},

		onDrop(e) {
			this.draghover = false;

			// ファイルだったら
			if (e.dataTransfer.files.length > 0) {
				for (const file of Array.from(e.dataTransfer.files)) {
					this.browser.upload(file, this.folder);
				}
				return;
			}

			//#region ドライブのファイル
			const driveFile = e.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FILE_);
			if (driveFile != null && driveFile != '') {
				const file = JSON.parse(driveFile);
				this.browser.removeFile(file.id);
				os.api('drive/files/update', {
					fileId: file.id,
					folderId: this.folder.id
				});
			}
			//#endregion

			//#region ドライブのフォルダ
			const driveFolder = e.dataTransfer.getData(_DATA_TRANSFER_DRIVE_FOLDER_);
			if (driveFolder != null && driveFolder != '') {
				const folder = JSON.parse(driveFolder);

				// 移動先が自分自身ならreject
				if (folder.id == this.folder.id) return;

				this.browser.removeFolder(folder.id);
				os.api('drive/folders/update', {
					folderId: folder.id,
					parentId: this.folder.id
				}).then(() => {
					// noop
				}).catch(err => {
					switch (err) {
						case 'detected-circular-definition':
							os.alert({
								title: this.$ts.unableToProcess,
								text: this.$ts.circularReferenceFolder
							});
							break;
						default:
							os.alert({
								type: 'error',
								text: this.$ts.somethingHappened
							});
					}
				});
			}
			//#endregion
		},

		onDragstart(e) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData(_DATA_TRANSFER_DRIVE_FOLDER_, JSON.stringify(this.folder));
			this.isDragging = true;

			// 親ブラウザに対して、ドラッグが開始されたフラグを立てる
			// (=あなたの子供が、ドラッグを開始しましたよ)
			this.browser.isDragSource = true;
		},

		onDragend() {
			this.isDragging = false;
			this.browser.isDragSource = false;
		},

		go() {
			this.browser.move(this.folder.id);
		},

		newWindow() {
			this.browser.newWindow(this.folder);
		},

		rename() {
			os.inputText({
				title: this.$ts.renameFolder,
				placeholder: this.$ts.inputNewFolderName,
				default: this.folder.name
			}).then(({ canceled, result: name }) => {
				if (canceled) return;
				os.api('drive/folders/update', {
					folderId: this.folder.id,
					name: name
				});
			});
		},

		deleteFolder() {
			os.api('drive/folders/delete', {
				folderId: this.folder.id
			}).then(() => {
				if (this.$store.state.uploadFolder === this.folder.id) {
					this.$store.set('uploadFolder', null);
				}
			}).catch(err => {
				switch(err.id) {
					case 'b0fc8a17-963c-405d-bfbc-859a487295e1':
						os.alert({
							type: 'error',
							title: this.$ts.unableToDelete,
							text: this.$ts.hasChildFilesOrFolders
						});
						break;
					default:
						os.alert({
							type: 'error',
							text: this.$ts.unableToDelete
						});
				}
			});
		},

		setAsUploadFolder() {
			this.$store.set('uploadFolder', this.folder.id);
		},

		onContextmenu(e) {
			os.contextMenu([{
				text: this.$ts.openInWindow,
				icon: 'fas fa-window-restore',
				action: () => {
					os.popup(import('./drive-window.vue'), {
						initialFolder: this.folder
					}, {
					}, 'closed');
				}
			}, null, {
				text: this.$ts.rename,
				icon: 'fas fa-i-cursor',
				action: this.rename
			}, null, {
				text: this.$ts.delete,
				icon: 'fas fa-trash-alt',
				danger: true,
				action: this.deleteFolder
			}], e);
		},
	}
});
</script>

<style lang="scss" scoped>
.rghtznwe {
	position: relative;
	padding: 8px;
	height: 64px;
	background: var(--driveFolderBg);
	border-radius: 4px;

	&, * {
		cursor: pointer;
	}

	*:not(.checkbox) {
		pointer-events: none;
	}

	> .checkbox {
		position: absolute;
		bottom: 8px;
		right: 8px;
		width: 16px;
		height: 16px;
		background: #fff;
		border: solid 1px #000;

		&.checked {
			background: var(--accent);
		}
	}

	&.draghover {
		&:after {
			content: "";
			pointer-events: none;
			position: absolute;
			top: -4px;
			right: -4px;
			bottom: -4px;
			left: -4px;
			border: 2px dashed var(--focus);
			border-radius: 4px;
		}
	}

	> .name {
		margin: 0;
		font-size: 0.9em;
		color: var(--desktopDriveFolderFg);

		> i {
			margin-right: 4px;
			margin-left: 2px;
			text-align: left;
		}
	}

	> .upload {
		margin: 4px 4px;
		font-size: 0.8em;
		text-align: right;
		color: var(--desktopDriveFolderFg);
	}
}
</style>
