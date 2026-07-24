#!/usr/bin/env bun
import { readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";

const ROOT = import.meta.dir;
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov", ".mkv", ".avi", ".m4v"]);
const WIDTH = 1280;
const HEIGHT = 720;
const CRF = 32;

const deleteOriginal = process.argv.includes("--delete") || process.argv.includes("-d");
const keepAudio = process.argv.includes("--audio");

async function probeSize(path: string): Promise<{ width: number; height: number }> {
	const proc = Bun.spawn([
		"ffprobe",
		"-v",
		"error",
		"-select_streams",
		"v:0",
		"-show_entries",
		"stream=width,height",
		"-of",
		"json",
		path,
	]);
	const { streams } = (await new Response(proc.stdout).json()) as {
		streams: { width: number; height: number }[];
	};
	return { width: streams[0]?.width ?? 0, height: streams[0]?.height ?? 0 };
}

async function main() {
	const entries = await readdir(ROOT, { withFileTypes: true });
	const videos = entries.filter(
		(e) => e.isFile() && VIDEO_EXTENSIONS.has(extname(e.name).toLowerCase()),
	);

	if (videos.length === 0) {
		console.log("No se encontraron videos en scripts/.");
		return;
	}

	for (const entry of videos) {
		const inputPath = join(ROOT, entry.name);
		const outputName = `${basename(entry.name, extname(entry.name))}.webm`;
		const outputPath = join(ROOT, outputName);

		const { width, height } = await probeSize(inputPath);
		const needsScale = width > WIDTH || height > HEIGHT;

		const args = ["ffmpeg", "-y", "-i", inputPath];
		if (needsScale) {
			args.push(
				"-vf",
				`scale=${WIDTH}:${HEIGHT}:force_original_aspect_ratio=increase,crop=${WIDTH}:${HEIGHT}`,
			);
		}
		args.push("-c:v", "libvpx-vp9", "-crf", String(CRF), "-b:v", "0", "-deadline", "good");
		args.push(...(keepAudio ? ["-c:a", "libopus"] : ["-an"]));
		args.push(outputPath);

		const proc = Bun.spawn(args, { stdout: "ignore", stderr: "ignore" });
		const exitCode = await proc.exited;

		if (exitCode !== 0) {
			console.error(`Error convirtiendo ${entry.name}`);
			continue;
		}

		console.log(`${entry.name} -> ${outputName}`);

		if (deleteOriginal) {
			await Bun.file(inputPath).delete();
		}
	}
}

main();
