#!/usr/bin/env bun
import { readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const ROOT = import.meta.dir;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".tiff", ".gif", ".avif", ".bmp"]);
const QUALITY = 83;
const WIDTH = 1280;
const HEIGHT = 720;

const deleteOriginal = process.argv.includes("--delete") || process.argv.includes("-d");

async function main() {
	const entries = await readdir(ROOT, { withFileTypes: true });
	const images = entries.filter(
		(e) => e.isFile() && IMAGE_EXTENSIONS.has(extname(e.name).toLowerCase()),
	);

	if (images.length === 0) {
		console.log("No se encontraron imágenes en scripts/.");
		return;
	}

	for (const entry of images) {
		const inputPath = join(ROOT, entry.name);
		const outputName = `${basename(entry.name, extname(entry.name))}.webp`;
		const outputPath = join(ROOT, outputName);

		await sharp(inputPath)
			.resize(WIDTH, HEIGHT, { fit: "cover", withoutEnlargement: true })
			.webp({ quality: QUALITY })
			.toFile(outputPath);
		console.log(`${entry.name} -> ${outputName}`);

		if (deleteOriginal) {
			await Bun.file(inputPath).delete();
		}
	}
}

main();
