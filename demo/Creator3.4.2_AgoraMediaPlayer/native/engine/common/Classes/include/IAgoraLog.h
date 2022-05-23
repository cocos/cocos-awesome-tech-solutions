//
//  Agora Media SDK
//
//  Copyright (c) 2015 Agora IO. All rights reserved.
//

#pragma once

#include <stdint.h>

namespace agora {
namespace commons { 
/**
 * Supported logging severities of SDK
 */
enum class LOG_LEVEL {
  LOG_LEVEL_NONE = 0x0000,
  LOG_LEVEL_INFO = 0x0001,
  LOG_LEVEL_WARN = 0x0002,
  LOG_LEVEL_ERROR = 0x0004,
  LOG_LEVEL_FATAL = 0x0008,
};

/*
The SDK uses ILogWriter class Write interface to write logs as application
The application inherits the methods Write() to implentation their own  log writ

Write has default implementation, it writes logs to files.
Application can use setLogFile() to change file location, see description of set
*/
class ILogWriter {
 public:
  /** user defined log Write function
  @param log level
  @param log message content
  @param log message length
  @return
   - 0: success
   - <0: failure
  */
  virtual int32_t writeLog(LOG_LEVEL level, const char* message, uint16_t length) = 0;
  virtual ~ILogWriter() {}
};

enum LOG_FILTER_TYPE {
  LOG_FILTER_OFF = 0,
  LOG_FILTER_DEBUG = 0x080f,
  LOG_FILTER_INFO = 0x000f,
  LOG_FILTER_WARN = 0x000e,
  LOG_FILTER_ERROR = 0x000c,
  LOG_FILTER_CRITICAL = 0x0008,
  LOG_FILTER_MASK = 0x80f,
};

} //namespace commons
} //namespace agora
