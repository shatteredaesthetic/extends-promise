"use strict";

const assert = require("assert");

const P = require("..");

const describe = global.describe;
const it = global.it;

describe("Promise", () => {
	it(".then: should be able to use as promise", () => {
		return new P(resolve => resolve())
			.then(() => P.resolve(1))
			.then(res => assert.strictEqual(res, 1));
	});

	it(".promisify: should be able to promisify callback method", () => {
		const fn = P.promisify((x, cb) => cb(null, x));

		return fn(1)
			.then(res => assert.strictEqual(res, 1));
	});

	it(".promisify: should reject callback method with error", () => {
		const fn = P.promisify(cb => cb(new Error("Callback error")));

		return fn()
			.then(() => Promise.reject(new Error("Did not reject")))
			.catch(err => assert.strictEqual(err.message, "Callback error"));
	});

	it(".promisify: should convert multiple arguments in callback to array", () => {
		const fn = P.promisify((x, y, cb) => cb(null, x, y));

		return fn(1, 2)
			.then(res => assert.deepEqual(res, [1, 2]));
	});

	it(".promisify: should be able to pass context to promisify", () => {
		const fn = P.promisify(function callbackMethod(cb) {
			cb(null, this);
		}, 1);

		return fn()
			.then(res => assert.strictEqual(res, 1));
	});

	it(".promisify: should use dynamic context if not specified", () => {
		const o = {
			fn : P.promisify(function callbackMethod(cb) {
				cb(null, this);
			})
		};

		return o.fn()
			.then(res => assert.strictEqual(res, o));
	});

	it(".fromCallback: should be able to use fromCallback to promisify", () => {
		return P
			.fromCallback(cb => cb(null, 1))
			.then(res => assert.strictEqual(res, 1));
	});

	it(".fromCallback: should reject fromCallback with error", () => {
		return P
			.fromCallback(cb => cb(new Error("Callback error")))
			.then(() => Promise.reject(new Error("Did not reject")))
			.catch(err => assert.strictEqual(err.message, "Callback error"));
	});

	it(".extend: should be able to extend existing Promise implementation", () => {
		class APromise extends Promise {}

		assert.strictEqual(P.extend(APromise), APromise);
		assert.strictEqual(APromise.promisify, P.promisify);

		return APromise
			.resolve()
			.return(1)
			.tap(res => assert.strictEqual(res, 1))
			.then(res => assert.strictEqual(res, 1));
	});
});
