import { commentModel } from "../modles/commentModel.js";
import { postModel } from "../modles/postModel.js";
import { voteModel } from "../modles/voteModel.js";
import { marked, Marked } from "marked";

import slugify from "slugify";

const postController = {
    async index(req, res) {
        try {
            const posts = await postModel.getAllPublished()   
            res.render("index", {
                title: "Tech Blog",
                posts
            })
        } catch (err) {
            console.log("Error loading homepage:", err)
            res.status(500).render("error/error", {
                title: "Error",
                message: "Failed to load homepage"
            })
        }
    }, 
 
    async show(req, res) {
        try {
            const slug = req.params.slug;
            const post = await postModel.findPostBySlug(slug)

            if (!post) {
                return res.status(404).render('error/404', { title: "Page not found." })
            }
            if (!post.is_published) {
                const user = req.session.user;
                if (!user || (user.id !== post.author_id && user.role !== "admin")) {
                    return res.status(404).render('error/404', { title: "Page not found." })
                }
            }

            await postModel.incrementViews(post.id)
            const comments = await commentModel.findCommentByPost(post.id);
            let userVote = null;
            if (req.session.user) {
                userVote = await voteModel.getUserVote(post.id, req.session.user.id)
            }
            const contentHtml = marked(post.content)

            res.render('posts/show', {
                title: post.meta_title || post.title,
                metaDespription: post.meta_despription || post.excerpt || "",
                metaKeywords: post.meta_keywords || post.tags || "",
                post,
                contentHtml,
                comments,
                userVote,
                session: req.session
            }) 

        } catch (error) {
            console.log(error)
            res.render("error/error", {
                title: "Error",
                message: "Failed to load post"
            })
        }
    },
 
    showCreatePost(req, res) {
        res.render("posts/create",
            { title: "Create new post" }
        )
    },

    async createPost(req, res) {
        try {
            const { title, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published } = req.body;
            const baseSlug = slugify(title, { lower: true, strict: true })
            let slug = baseSlug;
            const existing = await postModel.findPostBySlug(slug)
            if (existing) {
                slug = `${baseSlug}-${Date.now()}`
            }

            const post = await postModel.createPost({
                title,
                slug,
                content,
                excerpt: excerpt || content.substring(0, 200),
                meta_title: meta_title || title,
                meta_description: meta_description || excerpt || "",
                meta_keywords: meta_keywords || "",
                tags: tags || "",
                is_published: is_published === "true",
                author_id: req.session.user.id
            })
            req.session.success = "Post created successfully";
            // console.log("Post created success",post)//remove later
            res.redirect(`/posts/${post.slug}`)


        } catch (error) {
            console.log(error)
            req.session.error = "Failed to create post",
                res.redirect("/posts/create");
        }
    },
 
    async showEditePost(req, res) {
        try {
            const post = await postModel.findPostBySlug(req.params.slug)
            if (!post) {
                return res.status(403).render('404', { title: "Not found!!" })
            }
            const user = req.session.user;
            if (user.id !== post.author_id && user.role !== "admin") {
                return res.status(403).render('error/error', { title: "Forbidden", message: "You can not edite this post" })
            }

            res.render("posts/edite", { title: "Edite post", post })
        } catch (error) {
            console.log(error)
            res.redirect("/")
        }
    },

    async update(req, res) {
        try {
            const post = await postModel.findPostBySlug(req.params.slug)
            if (!post) {
                return res.status(403).render('404', { title: "Not found!!" })
            }
            const user = req.session.user;
            if (user.id !== post.author_id && user.role !== "admin") {
                return res.status(403).render('error/error', { title: "Forbidden", message: "Access denied" })
            }

            const { title, content, excerpt, meta_title, meta_description, meta_keywords, tags, is_published } = req.body;
            let slug = post.slug;
            if (title !== post.title) {
                slug = slugify(title, { lower: true, strict: true })
                const existing = await postModel.findPostBySlug(slug)
                if (existing && existing.id !== post.id) {
                    slug = `${slug}- ${Date.now()}`
                }
            }

            const updated = await postModel.updatePost(id, {
                title, slug, content, excerpt, meta_title, meta_description, meta_keywords, tags,
                is_published: is_published === 'true'
            })

            req.session.success = "Post Updated"
            res.redirect(`/posts/${updated.slug}`)

        } catch (error) {
            console.log(error)
            req.session.error = "Failed to update post"
            res.redirect(`/posts/${req.params.slug}/edit`)
        }
    },

    async deletePost(req, res) {
        try {
            const post = postModel.deletePost(req.params.slug)
            if (!post) return res.status(404).render('404', { title: "Not Found." })

            const user = req.session.user
            if (user.id !== post.author_id && user.role !== 'admin') {
                return res.status(403).render("error/error", { title: "Forbidden", message: "Access denied." })
            }

            await postModel.deletePost(post.id)
            req.session.success = "Post deleted successfully"
            res.redirect('/')

        } catch (error) {
            console.log(error)
            req.session.error = "Failed to delete post."
            res.redirect('/')
        }
    }


}

export { postController }