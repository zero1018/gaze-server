import Config from '../../config/config';
import { DataBaseFailed } from '../../core/httpException';
import redis from './redis';

/**
 * redis报错回调
 * @param err
 */
export function redisCatch(err: Error) {
  throw new DataBaseFailed(err.message);
}

/**
 * 选择数据库
 * @param DbName
 * @returns
 */
export async function selectDb(DbName: number) {
  return new Promise(resolve => {
    redis
      .select(DbName)
      .then(() => {
        resolve(true);
      })
      .catch(redisCatch);
  });
}

/**
 * 获取列表
 * @param {string} key 键
 * @param {boolean} isChildObject 元素是否为对象
 * @return { array } 返回数组
 */
export async function getList(key: string, isChildObject = false) {
  let data = await redis.lrange(key, 0, -1);
  if (isChildObject) {
    data = data.map((item: any) => {
      return JSON.parse(item);
    });
  }
  return data;
}

/**
 * 设置列表
 * @param {string} key 键
 * @param {object|string} value 值
 * @param {string} type 类型：push和unshift
 * @param {Number} expir 过期时间 单位秒
 * @return { Number } 返回索引
 */
export async function setList(key: string, value: object | string, type = 'push', expir = 0) {
  if (expir > 0) {
    await redis.expire(key, expir);
  }
  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }
  if (type === 'push') {
    return await redis.rpush(key, value);
  }
  return await redis.lpush(key, value);
}

/**
 * 设置 redis 缓存
 * @param { String } key 键
 * @param {String | Object | array} value 值
 * @param { Number } expir 过期时间 单位秒
 * @return { String } 返回成功字符串OK
 */
export async function set(key: string, value: string | object | Array<number>, expir = 0) {
  if (expir === 0) {
    return await redis.set(key, JSON.stringify(value));
  } else {
    return await redis.set(key, JSON.stringify(value), 'EX', expir);
  }
}

/**
 * 获取 redis 缓存
 * @param { String } key 键
 * @return { String | array | Object } 返回获取的数据
 */
export async function get(key: any) {
  const result = await redis.get(key);
  return result;
}

/**
 * redis 自增
 * @param { String } key 键
 * @param { Number } value 自增的值
 * @return { Number } 返回递增值
 */
export async function incr(key: string, number = 1) {
  if (number === 1) {
    return await redis.incr(key);
  } else {
    return await redis.incrby(key, number);
  }
}

/**
 * 查询长度
 * @param { String } key
 * @return { Number } 返回数据长度
 */
export async function strlen(key: string) {
  return await redis.strlen(key);
}

/**
 * 删除指定key
 * @param {String} key
 */
export async function remove(key: string) {
  return await redis.del(key);
}

/**
 * 清空缓存
 */
export async function clear() {
  return await redis.flushall();
}
