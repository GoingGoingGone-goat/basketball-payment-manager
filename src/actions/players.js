'use server';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPlayer = addPlayer;
exports.getActivePlayers = getActivePlayers;
exports.getAllPlayers = getAllPlayers;
exports.togglePlayerActive = togglePlayerActive;
exports.updatePlayerProfile = updatePlayerProfile;
exports.getPlayerDetail = getPlayerDetail;
var db_1 = require("@/lib/db");
var cache_1 = require("next/cache");
function addPlayer(name) {
    return __awaiter(this, void 0, void 0, function () {
        var player;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.player.create({
                        data: {
                            name: name,
                            active: true,
                        }
                    })];
                case 1:
                    player = _a.sent();
                    (0, cache_1.revalidatePath)('/');
                    return [2 /*return*/, player];
            }
        });
    });
}
function getActivePlayers() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.db.player.findMany({
                    where: { active: true },
                    orderBy: { name: 'asc' }
                })];
        });
    });
}
function getAllPlayers() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, db_1.db.player.findMany({
                    orderBy: { name: 'asc' }
                })];
        });
    });
}
function togglePlayerActive(id, active) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.player.update({
                        where: { id: id },
                        data: { active: active }
                    })];
                case 1:
                    _a.sent();
                    (0, cache_1.revalidatePath)('/players');
                    (0, cache_1.revalidatePath)('/');
                    return [2 /*return*/];
            }
        });
    });
}
function updatePlayerProfile(id, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.player.update({
                        where: { id: id },
                        data: data
                    })];
                case 1:
                    _a.sent();
                    (0, cache_1.revalidatePath)("/players/".concat(id));
                    (0, cache_1.revalidatePath)('/players');
                    return [2 /*return*/];
            }
        });
    });
}
function getPlayerDetail(id) {
    return __awaiter(this, void 0, void 0, function () {
        var player, gp, totalPoints, totalOnes, totalTwos, totalThrees, totalTeamPoints, totalOpponentPoints, ppg, onesPct, twosPct, threesPct, oRtg, dRtg, netRtg, pointsArray, highestScoringGame, medianPpg, mid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.db.player.findUnique({
                        where: { id: id },
                        include: {
                            GameStats: {
                                include: {
                                    Game: true
                                },
                                orderBy: {
                                    Game: {
                                        date: 'desc'
                                    }
                                }
                            }
                        }
                    })];
                case 1:
                    player = _a.sent();
                    if (!player)
                        return [2 /*return*/, null];
                    gp = player.GameStats.length;
                    totalPoints = 0;
                    totalOnes = 0;
                    totalTwos = 0;
                    totalThrees = 0;
                    totalTeamPoints = 0;
                    totalOpponentPoints = 0;
                    player.GameStats.forEach(function (stat) {
                        totalPoints += stat.points;
                        totalOnes += stat.ones;
                        totalTwos += stat.twos * 2;
                        totalThrees += stat.threes * 3;
                        totalTeamPoints += stat.Game.teamScore;
                        totalOpponentPoints += stat.Game.opponentScore;
                    });
                    ppg = gp > 0 ? (totalPoints / gp).toFixed(1) : '0.0';
                    onesPct = totalPoints > 0 ? ((totalOnes / totalPoints) * 100).toFixed(1) : '0.0';
                    twosPct = totalPoints > 0 ? ((totalTwos / totalPoints) * 100).toFixed(1) : '0.0';
                    threesPct = totalPoints > 0 ? ((totalThrees / totalPoints) * 100).toFixed(1) : '0.0';
                    oRtg = gp > 0 ? (totalTeamPoints / gp).toFixed(1) : '0.0';
                    dRtg = gp > 0 ? (totalOpponentPoints / gp).toFixed(1) : '0.0';
                    netRtg = gp > 0 ? ((totalTeamPoints / gp) - (totalOpponentPoints / gp)).toFixed(1) : '0.0';
                    pointsArray = player.GameStats.map(function (s) { return s.points; }).sort(function (a, b) { return a - b; });
                    highestScoringGame = pointsArray.length > 0 ? pointsArray[pointsArray.length - 1] : 0;
                    medianPpg = 0;
                    if (pointsArray.length > 0) {
                        mid = Math.floor(pointsArray.length / 2);
                        if (pointsArray.length % 2 === 0) {
                            medianPpg = (pointsArray[mid - 1] + pointsArray[mid]) / 2;
                        }
                        else {
                            medianPpg = pointsArray[mid];
                        }
                    }
                    return [2 /*return*/, __assign(__assign({}, player), { careerStats: {
                                gp: gp,
                                ppg: ppg,
                                medianPpg: medianPpg,
                                highestScoringGame: highestScoringGame,
                                onesPct: onesPct,
                                twosPct: twosPct,
                                threesPct: threesPct,
                                oRtg: oRtg,
                                dRtg: dRtg,
                                netRtg: netRtg,
                                totalPoints: totalPoints
                            }, recentGames: player.GameStats.slice(0, 10).map(function (stat) { return ({
                                id: stat.Game.id,
                                date: stat.Game.date,
                                opponent: stat.Game.opponent,
                                pointsScoed: stat.points,
                                result: stat.Game.result,
                                teamScore: stat.Game.teamScore,
                                opponentScore: stat.Game.opponentScore
                            }); }) })];
            }
        });
    });
}
