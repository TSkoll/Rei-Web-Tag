Vue.http.interceptors.push((request, next) => {
    request.credentials = true;
    next();
});

const app = new Vue({
    el: '#app',
    data: {
        tagName: '',
        tagContent: '',
        tagList: [],
        currentWorkingTag: {
             name: 'temp name',
             content: 'temp content',
             file: 'temp file',
             filebytes: null,
             isimage: false,
             imagedata: null,
             error: {
                 show: false,
                 message: ''
             },
             success: {
                 show: false,
                 message: ''
             }
        },
        uploadTag: {
            name: '',
            content: '',
            file: '',
            isimage: false,
            imagedata: null,
            error: {
                show: false,
                message: ''
            },
            success: {
                show: false,
                message: ''
            }
        }
    },
    methods: {
        processFile(event) {
            this.fileContent = event.target.files[0];
        },
        getData() {
            this.$http.get('/tag/list/').then(resp => {
                const content = resp.body;
                if (content && content.length > 0) {
                    this.tagList = (content) ? content : [];
                }
                else {
                    this.tagList = [];
                }
            }, resp => {
                this.tagList = [];
            });
        },
        async showModal(name) {
            const download = await this.$http.get(`/tag/get/${name}`);
            const tag = download.body;

            this.currentWorkingTag.name = tag.name;
            this.currentWorkingTag.content = tag.content;
            this.currentWorkingTag.file = tag.file;

            if (tag.file) {
                const mimedl = await this.$http.get(`/file/mime/${tag.file}`);
                const mime = mimedl.body;

                console.log(mime);

                if (mime.includes('image/')) {
                    this.currentWorkingTag.imagedata = `/file/get/${tag.file}`;
                    this.currentWorkingTag.isimage = true;
                } else {
                    this.currentWorkingTag.isimage = false;
                }
            } else {
                console.log('owo');
                this.currentWorkingTag.imagedata = "";
                this.currentWorkingTag.isimage = false;
            }

            this.$refs.editModal.show();
        },
        editModalFileChange(event) {
            const file = event.target.files[0];

            if (file.type.includes('image/')) {
                this.currentWorkingTag.imagedata = URL.createObjectURL(file);
                this.currentWorkingTag.isimage = true;
            } else {
                this.currentWorkingTag.isimage = false;
            }
        },
        editModalShown() {
            this.$refs.editModalFile.reset();

            this.currentWorkingTag.success.show = false;
            this.currentWorkingTag.error.show = false;
        },
        editModalOK(event) {
            let form = new FormData();
            form.append('name', this.currentWorkingTag.name);
            form.append('content', this.currentWorkingTag.content);
            
            if (this.currentWorkingTag.filebytes) {
                form.append('fileContent', this.currentWorkingTag.filebytes);
            }

            if (this.currentWorkingTag.file) {
                form.append('oldfile', this.currentWorkingTag.file);
            }

            this.$http.post('/tag/update', form)
            .then(resp => {
                console.log("tag update success!")

                this.currentWorkingTag.success.show = true;
                this.currentWorkingTag.success.message = "Tag updated!"

                this.currentWorkingTag.error.show = false;
            }, resp => {
                console.log("tag update error!")

                this.currentWorkingTag.error.show = true;
                this.currentWorkingTag.error.message = resp.body;

                this.currentWorkingTag.success.show = false;
            });
        },
        uploadModalFileChange(event) {
            const file = event.target.files[0];

            if (file.type.includes('image/')) {
                this.uploadTag.isimage = true;
                this.uploadTag.imagedata = URL.createObjectURL(file);
            } else {
                this.uploadTag.isimage = false;
            }
        },
        uploadModalShown() {
            this.uploadTag.name = '';
            this.uploadTag.content = '';

            this.$refs.uploadModalFile.reset();

            this.uploadTag.success.show = false;
            this.uploadTag.error.show = false;
            this.uploadTag.imagedata = '';
            this.uploadTag.isimage = false;
        },
        uploadModalOK(event) {
            event.preventDefault();

            if (this.uploadTag.name && (this.uploadTag.file || 
                    (this.uploadTag.content && this.uploadTag.content != ''))) {
                let form = new FormData();
                form.append('tagName', this.uploadTag.name);
                form.append('tagContent', this.uploadTag.content);
                form.append('fileContent', this.uploadTag.file);

                this.$http.post('/tag/upload', form)
                .then(resp => {
                    console.log("tag create success!")

                    this.uploadTag.error.show = false;

                    this.uploadTag.success.show = true;
                    this.uploadTag.success.message = "Tag uploaded!";

                    this.tagList.push(this.uploadTag.name);
                }, resp => {
                    console.log("tag create success!")

                    this.uploadTag.success.show = false;

                    this.uploadTag.error.show = true;
                    this.uploadTag.error.message = "Something went wrong while uploading a tag!";
                });
            } else {
                this.uploadTag.success.show = false;

                this.uploadTag.error.show = true;
                this.uploadTag.error.message = "A tag has to contain a name and a file or text content!";
            }
        },
        UploadBtnClick() {
            this.$refs.uploadModal.show();
        },
        closeEditModal() {
            this.$refs.editModal.hide();
        },
        editModalDelete() {
            this.$http.get('/tag/delete/' + this.currentWorkingTag.name)
            .then(resp => {
                console.log("Tag delete successful!")

                this.tagList.splice(this.tagList.indexOf(this.currentWorkingTag.name), 1);

                this.$refs.editModal.hide();
            }, resp => {
                this.uploadTag.success.show = false;

                this.uploadTag.error.show = true;
                this.uploadTag.error.message = "An error occured while trying to delete the tag!";
            });
        }
    },
    beforeMount() {
        this.getData();
    }
});