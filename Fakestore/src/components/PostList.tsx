type PostTag = {
	id: string
	label: string
}

export type Post = {
	id: string
	title: string
	body: string
	author: string
	createdAt: string
	tags?: PostTag[]
}

type PostListProps = {
	posts: Post[]
	onDelete?: (postId: string) => void
}

const PostList = ({ posts, onDelete }: PostListProps) => {
	if (posts.length === 0) {
		return (
			<section className="post-panel" aria-live="polite">
				<h3>No posts yet</h3>
				<p>Start by creating your first post.</p>
			</section>
		)
	}

	return (
		<section className="post-panel" aria-live="polite">
			<h3>Recent posts</h3>
			<ul className="post-list">
				{posts.map((post) => (
					<li key={post.id} className="post-card">
						<div className="post-header">
							<div>
								<h4>{post.title}</h4>
								<p className="post-meta">
									By {post.author} ·{' '}
									{new Date(post.createdAt).toLocaleDateString()}
								</p>
							</div>
							{onDelete ? (
								<button
									type="button"
									onClick={() => onDelete(post.id)}
									aria-label={`Delete ${post.title}`}
								>
									Delete
								</button>
							) : null}
						</div>
						<p className="post-body">{post.body}</p>
						{post.tags && post.tags.length > 0 ? (
							<div className="post-tags">
								{post.tags.map((tag) => (
									<span key={tag.id} className="post-tag">
										{tag.label}
									</span>
								))}
							</div>
						) : null}
					</li>
				))}
			</ul>
		</section>
	)
}

export default PostList
