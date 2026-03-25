import { useMemo, useState } from 'react'
import AddPost from '../components/AddPost'
import PostList from '../components/PostList'
import type { NewPost } from '../components/AddPost'
import type { Post } from '../components/PostList'

const Dashboard = () => {
	const [posts, setPosts] = useState<Post[]>(() => [
		{
			id: 'post-1',
				title: 'Welcome to Application',
			body: 'Share team updates, celebrate wins, and keep everyone aligned.',
			author: 'Product Team',
			createdAt: new Date().toISOString(),
			tags: [
				{ id: 'tag-1', label: 'announcement' },
				{ id: 'tag-2', label: 'culture' },
			],
		},
	])

	const totalPosts = useMemo(() => posts.length, [posts])

	const handleAddPost = (newPost: NewPost) => {
		const trimmedTags = newPost.tags
			.split(',')
			.map((tag) => tag.trim())
			.filter(Boolean)
		const tagObjects = trimmedTags.map((tag, index) => ({
			id: `${tag}-${index}`,
			label: tag,
		}))

		const post: Post = {
			id: `post-${Date.now()}`,
			title: newPost.title,
			body: newPost.body,
			author: 'You',
			createdAt: new Date().toISOString(),
			tags: tagObjects,
		}

		setPosts((current) => [post, ...current])
	}

	const handleDeletePost = (postId: string) => {
		setPosts((current) => current.filter((post) => post.id !== postId))
	}

	return (
		<main className="dashboard">
			<header>
				<h1>Team dashboard</h1>
				<p>
					{totalPosts} {totalPosts === 1 ? 'post' : 'posts'} shared this week.
				</p>
			</header>
			<div className="dashboard-grid">
				<AddPost onAdd={handleAddPost} />
				<PostList posts={posts} onDelete={handleDeletePost} />
			</div>
		</main>
	)
}

export default Dashboard
