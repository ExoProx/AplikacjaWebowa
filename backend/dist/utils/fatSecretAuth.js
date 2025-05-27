"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = void 0;
// utils/fatsecretAuth.ts
const axios_1 = __importDefault(require("axios"));
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'premier');
        const response = yield axios_1.default.post('https://oauth.fatsecret.com/connect/token', params, {
            auth: {
                username: process.env.FATSECRET_CLIENT_ID,
                password: process.env.FATSECRET_CLIENT_SECRET,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        return response.data.access_token;
    });
}
exports.getAccessToken = getAccessToken;
