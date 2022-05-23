#!/usr/bin/env node

/**
 * given that you're in a commit that multiple branches point to,
 * checkout to the next branch in the list.
 */

const { execSync } = require("child_process")

const gitHop = ({
	hasBack, //
}) => {
	const branches = execSync(`git branch --points-at @`, { encoding: "utf-8" }) // | sed '/^  @$/d;')"
		.split("\n")
		.filter(b => b.trim() !== "@")
		.filter(b => !!b)
		.map((b, idx) => ({
			isCurrent: b.startsWith("* "),
			branch: b.slice(2),
			idx,
		}))

	const normalizeFor = length => idx => (idx + length) % length
	const normalize = normalizeFor(branches.length)

	const findWithOffset = (offset = 1) => {
		const idx = branches.findIndex(b => b.isCurrent)
		const nextIdx = normalize((idx + offset))
		return branches[nextIdx]
	}
	// const findNext = findWithOffset(+1)
	// const findPrev = findWithOffset(-1)



	const offset = +1
	// const findTarget = hasBack ? findPrev : findNext
	// const findTarget = findWithOffset(offset * (hasBack ? -1 : 1))
	// const target = findTarget(branches)
	const target = findWithOffset(offset * (hasBack ? -1 : 1))

	const isRightBefore = b => normalize(b.idx + offset) === target.idx
	const isRightAfter  = b => normalize(b.idx - offset) === target.idx
	const isCurrent     = b => normalize(b.idx         ) === target.idx

	const getPrefix = b => 
		isRightBefore(b)
			? "back"
			: isRightAfter(b)
			? " ".repeat(4)
				: isCurrent(b)
					? "HEAD"
					: " ".repeat(4)

	// const text = branches.map(b => b.isCurrent ? "prev " + b.branch : b === target ? "curr " + b.branch : " ".repeat(5) + b.branch).join("\n")
	const text = branches.map((b) => getPrefix(b) + " " + b.branch).join("\n")

	execSync(`git checkout ${target.branch}`, { encoding: "utf-8", stdio: "ignore" })

	process.stdout.write(text + "\n")
}

const git_hop_cli = () => {
	process.argv.splice(0, 2)

	const arg0 = process.argv[0] || ""
	const backs = ["back", "b"]
	const hasBack = backs.includes(arg0.toLowerCase())

	gitHop({ 
		hasBack, //
	})
}

if (!module.parent) {
	git_hop_cli()
}

