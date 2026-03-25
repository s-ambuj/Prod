import { useState } from 'react'
import type { FormEvent } from 'react'

export type NewPost = {
	title: string
	body: string
	tags: string
}

type AddPostProps = {
	onAdd: (post: NewPost) => void
	isSubmitting?: boolean
}

const AddPost = ({ onAdd, isSubmitting = false }: AddPostProps) => {
	const [title, setTitle] = useState('')
	const [body, setBody] = useState('')
	const [tags, setTags] = useState('')
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const trimmedTitle = title.trim()
		const trimmedBody = body.trim()

		if (!trimmedTitle || !trimmedBody) {
			setError('Title and body are required.')
			return
		}

		setError(null)
		onAdd({ title: trimmedTitle, body: trimmedBody, tags })
		setTitle('')
		setBody('')
		setTags('')
	}

	return (
		<section className="add-post">
			<h3>Create a new post</h3>
			<form onSubmit={handleSubmit} aria-describedby="post-error">
				<label>
					Title
					<input
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="What's on your mind?"
						required
					/>
				</label>
				<label>
					Body
					<textarea
						value={body}
						onChange={(event) => setBody(event.target.value)}
						placeholder="Share your update with the team"
						rows={4}
						required
					/>
				</label>
				<label>
					Tags (comma separated)
					<input
						type="text"
						value={tags}
						onChange={(event) => setTags(event.target.value)}
						placeholder="product, launch, update"
					/>
				</label>
				{error ? (
					<p id="post-error" role="alert">
						{error}
					</p>
				) : null}
				<button type="submit" disabled={isSubmitting}>
					{isSubmitting ? 'Publishing...' : 'Publish post'}
				</button>
			</form>
		</section>
	)
}

export default AddPost
